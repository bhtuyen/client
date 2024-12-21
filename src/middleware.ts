import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import type { NextRequest } from 'next/server';

import { defaultLocale } from '@/config';
import { GuestOrderRole } from '@/constants/const';
import { Role } from '@/constants/enum';
import { routing } from '@/i18n/routing';
import { decodeJWT } from '@/lib/utils';

const managePaths = [/^\/vi\/manage.*/, /^\/en\/manage.*/];
const guestPaths = [/^\/vi\/guest\/tables\/[^/]+\/menu$/, /^\/en\/guest\/tables\/[^/]+\/menu$/];
const ownerPaths = [/^\/vi\/manage\/employees$/, /^\/en\/manage\/employees$/];
const privatePaths = [...managePaths, ...guestPaths];
const unAuthPaths = [/^\/vi\/login$/, /^\/en\/login$/, /^\/vi\/guest\/tables\/[^/]+$/, /^\/en\/guest\/tables\/[^/]+$/];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isRefreshToken = request.cookies.has('refreshToken');
  const isAccessToken = request.cookies.has('accessToken');
  const locale = request.cookies.get('NEXT_LOCALE')?.value ?? defaultLocale;

  // 1. Chua login thi khong cho vao path private
  if (privatePaths.some((path) => path.test(pathname)) && !isRefreshToken) {
    // 1.1. Neu la guest thi redirect ve trang chu
    if (guestPaths.some((path) => path.test(pathname))) {
      return NextResponse.redirect(new URL(`/${locale}`, request.nextUrl));
    }

    // 1.2. Neu la owner hoac employee thi redirect ve trang login
    const loginPath = new URL(`/${locale}/login`, request.nextUrl);
    loginPath.searchParams.set('clearTokens', 'true');
    return NextResponse.redirect(loginPath);
  }

  // 2. Da login
  if (isRefreshToken) {
    const tokenPayload = decodeJWT(request.cookies.get('refreshToken')?.value ?? '');
    const { role } = tokenPayload;

    // 2.1. Neu da login thi khong cho vao path login
    if (unAuthPaths.some((path) => path.test(pathname))) {
      // 2.1.1. Neu la guest thi redirect ve trang guest order
      if (role === GuestOrderRole) {
        const { tableNumber } = tokenPayload;
        return NextResponse.redirect(new URL(`/${locale}/guest/tables/${tableNumber}/menu`, request.nextUrl));
      }
      // 2.1.2. Neu la owner hoac employee thi redirect ve trang chu
      return NextResponse.redirect(new URL(`/${locale}`, request.nextUrl));
    }

    // 2.2. Neu da login ma access token het han thi refresh token
    if (privatePaths.some((path) => path.test(pathname)) && !isAccessToken) {
      const url = new URL(`/${locale}/refresh-token`, request.url);
      url.searchParams.set('refreshToken', request.cookies.get('refreshToken')?.value ?? '');
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    const isGuestGoToManage = role === GuestOrderRole && managePaths.some((path) => path.test(pathname));
    const isNotGuestGoToGuest = role !== GuestOrderRole && guestPaths.some((path) => path.test(pathname));
    const isNotOwnerGoToOwner = role !== Role.Owner && ownerPaths.some((path) => path.test(pathname));

    // 2.3. Neu truy cap kh dung role thi redirect ve trang chu
    if (isNotGuestGoToGuest || isNotOwnerGoToOwner) {
      return NextResponse.redirect(new URL(`/${locale}`, request.nextUrl));
    }

    // 2.4. Neu la guest thi redirect ve trang guest order
    if (isGuestGoToManage) {
      const { tableNumber } = tokenPayload;
      return NextResponse.redirect(new URL(`/${locale}/manage/tables/${tableNumber}/menu`, request.nextUrl));
    }
  }

  return createMiddleware(routing)(request);
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/', '/(vi|en)/:path*']
};
