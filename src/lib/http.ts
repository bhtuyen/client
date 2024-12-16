import type { LoginRes, Token } from '@/schemaValidations/auth.schema';
import type { RequestInit } from 'next/dist/server/web/spec-extension/request';

import envConfig from '@/config';
import { redirect } from '@/i18n/routing';
import {
  getAccessTokenFromLocalStorage,
  normalizePath,
  removeAuthTokens,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage
} from '@/lib/utils';

/**
 * customOptions: Tùy chỉnh options cho fetch
 */
type customOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string | undefined;
};

const ENTITY_ERROR_STATUS = 422;
const UNAUTHORIZED_STATUS = 401;

/**
 * EntityErrorPayload: Lỗi khi validate entity
 */
type EntityErrorPayload = {
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

/**
 * HttpError: Lỗi khi gọi api
 */
export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    [key: string]: any;
  };
  constructor({ status, payload, message = 'Http Error' }: { status: number; payload: any; message?: string }) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

/**
 * EntityError: Lỗi khi validate entity
 */
export class EntityError extends HttpError {
  status: typeof ENTITY_ERROR_STATUS;
  payload: EntityErrorPayload;
  constructor({ status, payload }: { status: typeof ENTITY_ERROR_STATUS; payload: EntityErrorPayload }) {
    super({ status, payload, message: 'Entity Error' });
    this.status = ENTITY_ERROR_STATUS;
    this.payload = payload;
  }
}

/**
 * clientLogoutRequest: Promise logout khi client gọi api
 */
let clientLogoutRequest: null | Promise<any> = null;

/**
 * @description Môi trường client
 */
const isClient = typeof window !== 'undefined';

/**
 * @param url
 * @param options
 * @param method
 * @returns
 */
const request = async <Response>(url: string, options?: customOptions | undefined, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET') => {
  let body: FormData | string | undefined = undefined;

  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body) {
    body = JSON.stringify(options.body);
  }

  const baseHeaders: { [key: string]: string } =
    body instanceof FormData
      ? {}
      : {
          'Content-Type': 'application/json'
        };

  if (isClient) {
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      baseHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  /**
   *  Nếu có baseUrl thì sử dụng baseUrl, không thì sử dụng envConfig.NEXT_PUBLIC_API_ENDPOINT
   *  => call next api
   */
  const baseUrl = options?.baseUrl === undefined ? envConfig.NEXT_PUBLIC_API_ENDPOINT : options?.baseUrl;

  const fullUrl = `${baseUrl}/${normalizePath(url)}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers
    },
    method,
    body
  });

  const payload: Response = await res.json();

  const data = {
    status: res.status,
    payload
  };

  /**
   * Handle lỗi khi gọi api
   */
  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError({
        status: res.status,
        payload: data.payload as EntityErrorPayload
      });
    } else if (res.status === UNAUTHORIZED_STATUS) {
      // Nếu là client thì xử lý logout ngay
      if (isClient) {
        if (!clientLogoutRequest) {
          clientLogoutRequest = fetch('/api/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ force: true }),
            headers: {
              ...baseHeaders
            }
          });

          try {
            await clientLogoutRequest;
          } catch (error) {
            console.error(error);
          } finally {
            removeAuthTokens();
            clientLogoutRequest = null;
            redirect('/login');
          }
        }
      } else {
        // Nếu là server thì redirect sang trang logout
        const accessToken = (options?.headers as any)?.Authorization.split('Bearer ')[1];

        // This Func is default throw an error, so we don't need to catch it
        redirect(`/logout?accessToken=${accessToken}`);
      }
    } else {
      throw new HttpError(data);
    }
  }

  // Lưu accessToken và refreshToken vào localStorage khi login
  // Xóa accessToken và refreshToken khỏi localStorage khi logout
  if (isClient) {
    const normalizedUrl = normalizePath(url);
    if (['api/auth/login', 'api/guest/auth/login'].includes(normalizedUrl)) {
      const { accessToken, refreshToken } = (payload as LoginRes).data;
      setAccessTokenToLocalStorage(accessToken);
      setRefreshTokenToLocalStorage(refreshToken);
    } else if ('api/auth/set-cookie-oauth' === normalizedUrl) {
      const { accessToken, refreshToken } = payload as Token;
      setAccessTokenToLocalStorage(accessToken);
      setRefreshTokenToLocalStorage(refreshToken);
    } else if (['api/auth/logout', 'api/guest/auth/logout'].includes(normalizedUrl)) {
      removeAuthTokens();
    }
  }

  return data;
};

const http = {
  get<Res>(url: string, options?: Omit<customOptions, 'body'> | undefined) {
    return request<Res>(url, options);
  },
  post<Res>(url: string, body: any, options?: Omit<customOptions, 'body'> | undefined) {
    return request<Res>(url, { ...options, body }, 'POST');
  },
  put<Res>(url: string, body: any, options?: Omit<customOptions, 'body'> | undefined) {
    return request<Res>(url, { ...options, body }, 'PUT');
  },
  delete<Res>(url: string, options?: Omit<customOptions, 'body'> | undefined) {
    return request<Res>(url, { ...options }, 'DELETE');
  }
};

export default http;
