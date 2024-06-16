import authApiRequest from "@/app/apiRequests/auth";
import { HttpError } from "@/lib/http";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import { decode, JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType;
  const cookieStore = cookies();

  try {
    const { payload } = await authApiRequest.sLogin(body);

    const { accessToken, refreshToken } = payload.data;

    const { exp: expAccessToken } = decode(accessToken) as JwtPayload;
    const { exp: expRefreshToken } = decode(refreshToken) as JwtPayload;

    cookieStore.set("accessToken", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: (expAccessToken as number) * 1000,
    });

    cookieStore.set("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: (expRefreshToken as number) * 1000,
    });

    return Response.json({ payload });
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status });
    } else {
      return Response.json({ message: "Have an error" }, { status: 500 });
    }
  }
}
