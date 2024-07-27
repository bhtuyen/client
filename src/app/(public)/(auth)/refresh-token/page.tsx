"use client";
import {
  checkAndRefreshToken,
  getRefreshTokenFromLocalStorage,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RefreshToken() {
  const router = useRouter();

  const searchParam = useSearchParams();
  const refreshToken = searchParam.get("refreshToken");
  const redirectPathname = searchParam.get("redirect");

  useEffect(() => {
    if (refreshToken && refreshToken === getRefreshTokenFromLocalStorage()) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || "/");
        },
      });
    } else {
      router.push("/");
    }
  }, [router, refreshToken, redirectPathname]);

  return <div>Refresh token...</div>;
}
