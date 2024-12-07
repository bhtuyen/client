import http from '@/lib/http';
import { Login, LoginRes, RefreshToken, RefreshTokenRes, Token } from '@/schemaValidations/auth.schema';
import { MessageRes } from '@/schemaValidations/common.schema';

const authApiRequest = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: RefreshTokenRes;
  }> | null,
  sLogin: (body: Login) => http.post<LoginRes>('/auth/login', body),
  login: (body: Login) =>
    http.post<LoginRes>('/api/auth/login', body, {
      baseUrl: ''
    }),
  sLogout: (body: Token) =>
    http.post<MessageRes>(
      '/auth/logout',
      {
        refreshToken: body.refreshToken
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`
        }
      }
    ),
  logout: () =>
    http.post('/api/auth/logout', null, {
      baseUrl: ''
    }),
  sRefreshToken: (body: RefreshToken) => http.post<RefreshTokenRes>('/auth/refresh-token', body),
  async refreshToken() {
    if (this.refreshTokenRequest) {
      return this.refreshTokenRequest;
    }

    this.refreshTokenRequest = http.post<RefreshTokenRes>('/api/auth/refresh-token', null, {
      baseUrl: ''
    });

    const result = await this.refreshTokenRequest;
    this.refreshTokenRequest = null;
    return result;
  },
  setCookieOauth: (body: Token) => http.post('/api/auth/set-cookie-oauth', body, { baseUrl: '' })
};

export default authApiRequest;
