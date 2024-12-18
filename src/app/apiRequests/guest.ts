import { stringify } from 'querystring';

import type { Logout, RefreshToken, RefreshTokenRes } from '@/schemaValidations/auth.schema';
import type { MessageRes, Period } from '@/schemaValidations/common.schema';
import type { GuestCreateOrders, GuestLogin, GuestLoginRes, GuestsRes } from '@/schemaValidations/guest.schema';
import type { OrdersDtoDetailRes } from '@/schemaValidations/order.schema';

import http from '@/lib/http';

const prefix = 'guest';

const guestApiRequest = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: RefreshTokenRes;
  }> | null,
  login: (body: GuestLogin) => http.post<GuestLoginRes>(`/api/${prefix}/auth/login`, body, { baseUrl: '' }),
  sLogin: (body: GuestLogin) => http.post<GuestLoginRes>(`/${prefix}/auth/login`, body),
  logout: (body: Logout) => http.post<MessageRes>(`/api/${prefix}/auth/logout`, body, { baseUrl: '' }),
  sLogout: (body: Logout & { accessToken: string }) =>
    http.post<MessageRes>(
      `/${prefix}/auth/logout`,
      { refreshToken: body.refreshToken },
      { headers: { Authorization: `Bearer ${body.accessToken}` } }
    ),
  sRefreshToken: (body: RefreshToken) => http.post<RefreshTokenRes>(`/${prefix}/auth/refresh-token`, body),
  async refreshToken() {
    if (this.refreshTokenRequest) {
      return this.refreshTokenRequest;
    }
    this.refreshTokenRequest = http.post<RefreshTokenRes>(`/api/${prefix}/auth/refresh-token`, null, {
      baseUrl: ''
    });
    const result = await this.refreshTokenRequest;
    this.refreshTokenRequest = null;
    return result;
  },
  orders: (body: GuestCreateOrders) => http.post<OrdersDtoDetailRes>(`/${prefix}/orders`, body),
  getGuests: ({ fromDate, toDate }: Period) =>
    http.get<GuestsRes>(`${prefix}/?${stringify({ fromDate: fromDate?.toISOString(), toDate: toDate?.toISOString() })}`)
};

export default guestApiRequest;
