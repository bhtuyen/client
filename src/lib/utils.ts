import { toast } from "@/components/ui/use-toast";
import { EntityError } from "@/lib/http";
import { type ClassValue, clsx } from "clsx";
import { decode } from "jsonwebtoken";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";

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
  localStorage.getItem("accessToken");

export const removeAccessTokenFromLocalStorage = () =>
  localStorage.removeItem("accessToken");

export const getRefreshTokenFromLocalStorage = () =>
  localStorage.getItem("refreshToken");

export const removeRefreshTokenFromLocalStorage = () =>
  localStorage.removeItem("refreshToken");
