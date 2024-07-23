import authApiRequest from "@/app/apiRequests/auth";
import { decodeJWT } from "@/lib/utils";
import { JwtPayload } from "jsonwebtoken";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = cookies();

  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    console.log("Not found RefreshToken");
    return Response.json(
      { message: "Not found RefreshToken" },
      { status: 401 }
    );
  }

  try {
    const { payload } = await authApiRequest.sRefreshToken({
      refreshToken,
    });

    const { exp: expAccessToken } = decodeJWT<JwtPayload & { exp: number }>(
      payload.data.accessToken
    );
    const { exp: expRefreshToken } = decodeJWT<JwtPayload & { exp: number }>(
      payload.data.refreshToken
    );

    const optionCookie: Partial<ResponseCookie> = {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    };

    cookieStore.set("accessToken", payload.data.accessToken, {
      ...optionCookie,
      expires: expAccessToken * 1000,
    });

    cookieStore.set("refreshToken", payload.data.refreshToken, {
      ...optionCookie,
      expires: expRefreshToken * 1000,
    });

    return Response.json(payload);
  } catch (error: any) {
    console.log("Have an error");
    return Response.json(
      { message: error?.message ?? "Have an error" },
      { status: 401 }
    );
  }
}
