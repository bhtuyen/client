import { cookies } from 'next/headers';

import type { Token } from '@/schemaValidations/auth.schema';
import type { JwtPayload } from 'jsonwebtoken';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

import { HttpError } from '@/lib/http';
import { decodeJWT } from '@/lib/utils';

export async function POST(request: Request) {
  const body = (await request.json()) as Token;

  const cookieStore = cookies();

  try {
    const { accessToken, refreshToken } = body;

    const { exp: expAccessToken } = decodeJWT<JwtPayload & { exp: number }>(accessToken);
    const { exp: expRefreshToken } = decodeJWT<JwtPayload & { exp: number }>(refreshToken);

    const optionCookie: Partial<ResponseCookie> = {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true
    };

    cookieStore.set('accessToken', accessToken, {
      ...optionCookie,
      expires: expAccessToken * 1000
    });

    cookieStore.set('refreshToken', refreshToken, {
      ...optionCookie,
      expires: expRefreshToken * 1000
    });

    return Response.json(body);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status });
    } else {
      return Response.json({ message: 'Have an error' }, { status: 500 });
    }
  }
}
