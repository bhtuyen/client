import authApiRequest from '@/app/apiRequests/auth';
import { toast } from '@/components/ui/use-toast';
import envConfig from '@/config';
import { OrderStatus, Role } from '@/constants/enum';
import { EntityError } from '@/lib/http';
import { type ClassValue, clsx } from 'clsx';
import { decode } from 'jsonwebtoken';
import { BookX, CookingPot, HandCoins, Loader, Truck } from 'lucide-react';
import { UseFormSetError } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { TokenPayload } from '@/types/jwt.types';
import guestApiRequest from '@/app/apiRequests/guest';
import slugify from 'slugify';

const isBrowser = typeof window !== 'undefined';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleErrorApi = ({
  error,
  setError,
  duration
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((error) => {
      setError(error.field, {
        type: 'server',
        message: error.message
      });
    });
  } else {
    toast({
      title: 'Error',
      description: error?.payload?.message ?? 'An error occurred',
      variant: 'destructive',
      duration: duration ?? 5000
    });
  }
};
export const normalizePath = (path: string) => (path.startsWith('/') ? path.slice(1) : path);

export const decodeJWT = <Payload = TokenPayload>(token: string): Payload => {
  return decode(token) as Payload;
};

export const getAccessTokenFromLocalStorage = () => (isBrowser ? localStorage.getItem('accessToken') : null);

export const removeAccessTokenFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem('accessToken');
  }
};

export const getRefreshTokenFromLocalStorage = () => (isBrowser ? localStorage.getItem('refreshToken') : null);

export const removeRefreshTokenFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem('refreshToken');
  }
};

export const setAccessTokenToLocalStorage = (token: string) => {
  if (isBrowser) {
    localStorage.setItem('accessToken', token);
  }
};

export const setRefreshTokenToLocalStorage = (token: string) => {
  if (isBrowser) {
    localStorage.setItem('refreshToken', token);
  }
};

export const removeAuthTokens = () => {
  removeAccessTokenFromLocalStorage();
  removeRefreshTokenFromLocalStorage();
};
export type ParamType = { onError?: () => void; onSuccess?: () => void; force?: boolean };
export const checkAndRefreshToken = async (param?: ParamType) => {
  const accessToken = getAccessTokenFromLocalStorage();
  const refreshToken = getRefreshTokenFromLocalStorage();
  if (!accessToken || !refreshToken) return;

  const accessTokenPayload = decodeJWT(accessToken);
  const refreshTokenPayload = decodeJWT(refreshToken);

  const now = new Date().getTime() / 1000 - 1;

  // check if refresh token is expired -> logout
  if (refreshTokenPayload.exp <= now) {
    removeAuthTokens();
    param?.onError && param.onError();
    return;
  }

  if (param?.force || accessTokenPayload.exp - now < (accessTokenPayload.exp - accessTokenPayload.iat) / 3) {
    // refresh token
    try {
      const role = accessTokenPayload.role;
      const res = role === Role.Guest ? await guestApiRequest.refreshToken() : await authApiRequest.refreshToken();
      const { accessToken, refreshToken } = res.payload.data;
      setAccessTokenToLocalStorage(accessToken);
      setRefreshTokenToLocalStorage(refreshToken);
      param?.onSuccess && param.onSuccess();
    } catch (error) {
      param?.onError && param.onError();
    }
  }
};

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(number);
};

export const getTableLink = ({
  token,
  tableNumber,
  locale
}: {
  token: string;
  tableNumber: string;
  locale: string;
}) => {
  return envConfig.NEXT_PUBLIC_URL + `/${locale}/guest/tables/` + tableNumber + '?token=' + token;
};

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(removeAccents(matchText.trim().toLowerCase()));
};

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss dd/MM/yyyy');
};

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss');
};

export const getOauthGoogleUrl = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: envConfig.NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI,
    client_id: envConfig.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(
      ' '
    )
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};

export const wrapperServerApi = async <T>(fn: () => Promise<T>) => {
  let result: T | null = null;
  try {
    result = await fn();
  } catch (error: any) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
  }
  return result;
};

export const generateSlugify = ({ name, id }: { name: string; id: string }) => {
  return `${slugify(name)}-.${id}`;
};

export const getIdFromSlugifyString = (slugifyString: string) => {
  return slugifyString.split('-.')[1];
};

export const getEnumValues = <T extends { [key: string]: string }>(enumObj: T): T[keyof T][] => {
  return Object.values(enumObj) as T[keyof T][];
};

export const OrderStatusIcon = {
  [OrderStatus.Pending]: Loader,
  [OrderStatus.Processing]: CookingPot,
  [OrderStatus.Rejected]: BookX,
  [OrderStatus.Delivered]: Truck,
  [OrderStatus.Paid]: HandCoins
};
