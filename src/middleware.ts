import { decodeJWT } from '@/lib/utils';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/constants/enum';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { defaultLocale } from '@/config';

const managePaths = ['/vi/manage', '/en/manage'];
const guestPaths = ['/vi/guest/menu', '/en/guest/menu', '/vi/guest/orders', '/en/guest/orders'];
const ownerPaths = ['/vi/manage/accounts', '/en/manage/accounts'];
const privatePaths = [...managePaths, ...guestPaths];
const unAuthPaths = ['/vi/login', '/en/login'];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isRefreshToken = request.cookies.has('refreshToken');
  const isAccessToken = request.cookies.has('accessToken');
  const locale = request.cookies.get('NEXT_LOCALE')?.value ?? defaultLocale;

  // 1. Chua login thi khong cho vao path private
  if (privatePaths.some((path) => pathname.startsWith(path)) && !isRefreshToken) {
    const url = new URL(`/${locale}/login`, request.url);
    url.searchParams.set('clearTokens', 'true');
    return NextResponse.redirect(url);
  }

  // 2. Da login
  if (isRefreshToken) {
    // 2.1. Neu da login thi khong cho vao path login
    if (unAuthPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL(`/${locale}`, request.nextUrl));
    }

    // 2.2. Neu da login ma access token het han thi refresh token
    if (privatePaths.some((path) => pathname.startsWith(path)) && !isAccessToken) {
      const url = new URL(`/${locale}/refresh-token`, request.url);
      url.searchParams.set('refreshToken', request.cookies.get('refreshToken')?.value ?? '');
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // 2.3. Neu truy cap kh dung role thi redirect ve trang chu
    const role = decodeJWT(request.cookies.get('accessToken')?.value ?? '')?.role;

    const isGuestGoToManage = role === Role.Guest && managePaths.some((path) => pathname.startsWith(path));
    const isNotGuestGoToGuest = role !== Role.Guest && guestPaths.some((path) => pathname.startsWith(path));
    const isNotOwnerGoToOwner = role !== Role.Owner && ownerPaths.some((path) => pathname.startsWith(path));

    if (isGuestGoToManage || isNotGuestGoToGuest || isNotOwnerGoToOwner) {
      return NextResponse.redirect(new URL(`/${locale}`, request.nextUrl));
    }
  }

  return createMiddleware(routing)(request);
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/', '/(vi|en)/:path*']
};
