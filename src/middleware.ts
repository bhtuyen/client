import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const privatePaths = ['/manage'];

const unAuthPaths = ['/login'];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isRefreshToken = request.cookies.has('refreshToken');
  const isAccessToken = request.cookies.has('accessToken');

  // not login
  if (privatePaths.some((path) => pathname.startsWith(path)) && !isRefreshToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('clearTokens', 'true');
    return NextResponse.redirect(url);
  }

  // login
  if (unAuthPaths.some((path) => pathname.startsWith(path)) && isRefreshToken) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  // access token expired
  if (privatePaths.some((path) => pathname.startsWith(path)) && !isAccessToken && isRefreshToken) {
    const url = new URL('/refresh-token', request.url);
    url.searchParams.set('refreshToken', request.cookies.get('refreshToken')?.value ?? '');

    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/manage/:path*', '/login']
};
