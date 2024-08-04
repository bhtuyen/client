import http from '@/lib/http';
import { LogoutBodyType, RefreshTokenBodyType, RefreshTokenResType } from '@/schemaValidations/auth.schema';
import { MessageResType } from '@/schemaValidations/common.schema';
import {
  GuestCreateOrdersBodyType,
  GuestCreateOrdersResType,
  GuestGetOrdersResType,
  GuestLoginBodyType,
  GuestLoginResType
} from '@/schemaValidations/guest.schema';

const prefix = '/guests';

const guestApiRequest = {
  login: (body: GuestLoginBodyType) => http.post<GuestLoginResType>(`/api/${prefix}/auth/login`, body, { baseUrl: '' }),
  sLogin: (body: GuestLoginBodyType) => http.post<GuestLoginResType>(`${prefix}/auth/login`, body),
  logout: (body: LogoutBodyType) => http.post<MessageResType>(`/api/${prefix}/auth/logout`, body, { baseUrl: '' }),
  sLogout: (body: LogoutBodyType & { accessToken: string }) =>
    http.post<MessageResType>(
      `${prefix}/auth/logout`,
      { refreshToken: body.refreshToken },
      { headers: { Authorization: `Bearer ${body.accessToken}` } }
    ),
  refreshToken: (body: RefreshTokenBodyType) =>
    http.post<RefreshTokenResType>(`/api/${prefix}/auth/refresh-token`, body, { baseUrl: '' }),
  sRefreshToken: (body: RefreshTokenBodyType) => http.post<RefreshTokenResType>(`${prefix}/auth/refresh-token`, body),
  orders: (body: GuestCreateOrdersBodyType) => http.post<GuestCreateOrdersResType>(`${prefix}/orders`, body),
  getOrders: () => http.get<GuestGetOrdersResType>(`${prefix}/orders`)
};

export default guestApiRequest;
