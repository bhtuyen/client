import guestApiRequest from '@/app/apiRequests/guest';
import { HttpError } from '@/lib/http';
import { decodeJWT } from '@/lib/utils';
import { GuestLoginBodyType } from '@/schemaValidations/guest.schema';
import { JwtPayload } from 'jsonwebtoken';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = (await request.json()) as GuestLoginBodyType;

  const cookieStore = cookies();

  try {
    const { payload } = await guestApiRequest.sLogin(body);

    const { accessToken, refreshToken } = payload.data;

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

    return Response.json(payload);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status });
    } else {
      return Response.json({ message: 'Have an error' }, { status: 500 });
    }
  }
}
