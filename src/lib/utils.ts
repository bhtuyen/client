import authApiRequest from "@/app/apiRequests/auth";
import { jwtPayload } from "@/components/refresh-token";
import { toast } from "@/components/ui/use-toast";
import { EntityError } from "@/lib/http";
import { type ClassValue, clsx } from "clsx";
import { decode } from "jsonwebtoken";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";

const isBrowser = typeof window !== "undefined";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((error) => {
      setError(error.field, {
        type: "server",
        message: error.message,
      });
    });
  } else {
    toast({
      title: "Error",
      description: error?.payload?.message ?? "An error occurred",
      variant: "destructive",
      duration: duration ?? 5000,
    });
  }
};
export const normalizePath = (path: string) =>
  path.startsWith("/") ? path.slice(1) : path;

export const decodeJWT = <Payload = any>(token: string): Payload => {
  return decode(token) as Payload;
};

export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("accessToken") : null;

export const removeAccessTokenFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem("accessToken");
  }
};

export const getRefreshTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("refreshToken") : null;

export const removeRefreshTokenFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem("refreshToken");
  }
};

export const setAccessTokenToLocalStorage = (token: string) => {
  if (isBrowser) {
    localStorage.setItem("accessToken", token);
  }
};

export const setRefreshTokenToLocalStorage = (token: string) => {
  if (isBrowser) {
    localStorage.setItem("refreshToken", token);
  }
};

export const removeAuthTokens = () => {
  removeAccessTokenFromLocalStorage();
  removeRefreshTokenFromLocalStorage();
};

export const checkAndRefreshToken = async (param?: {
  onError?: () => void;
  onSuccess?: () => void;
}) => {
  const accessToken = getAccessTokenFromLocalStorage();
  const refreshToken = getRefreshTokenFromLocalStorage();
  if (!accessToken || !refreshToken) return;

  const accessTokenPayload = decodeJWT<jwtPayload>(accessToken);
  const refreshTokenPayload = decodeJWT<jwtPayload>(refreshToken);

  const now = new Date().getTime() / 1000 - 1;

  // check if refresh token is expired -> logout
  if (refreshTokenPayload.exp <= now) {
    removeAuthTokens();
    param?.onError && param.onError();
    return;
  }

  if (
    accessTokenPayload.exp - now <
    (accessTokenPayload.exp - accessTokenPayload.iat) / 3
  ) {
    // refresh token
    try {
      const res = await authApiRequest.refreshToken();
      const { accessToken, refreshToken } = res.payload.data;
      setAccessTokenToLocalStorage(accessToken);
      setRefreshTokenToLocalStorage(refreshToken);
      param?.onSuccess && param.onSuccess();
    } catch (error) {
      param?.onError && param.onError();
    }
  }
};
