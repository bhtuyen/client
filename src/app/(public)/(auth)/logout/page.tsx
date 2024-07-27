"use client";
import { useLogoutMutation } from "@/app/queries/useAuth";
import { useAppContext } from "@/components/app-provider";
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Logout() {
  const { mutateAsync } = useLogoutMutation();
  const { setIsAuth } = useAppContext();
  const router = useRouter();

  const ref = useRef<any>(null);

  const searchParam = useSearchParams();
  const refreshToken = searchParam.get("refreshToken");
  const accessToken = searchParam.get("accessToken");

  useEffect(() => {
    if (
      ref.current ||
      (refreshToken && refreshToken !== getRefreshTokenFromLocalStorage()) ||
      (accessToken && accessToken !== getAccessTokenFromLocalStorage())
    ) {
      router.push("/");
      return;
    }

    ref.current = mutateAsync;
    let timer: NodeJS.Timeout;
    mutateAsync().then(() => {
      timer = setTimeout(() => {
        ref.current = null;
      }, 1000);
      setIsAuth(false);
      router.push("/login");
    });

    return () => {
      clearTimeout(timer);
    };
  }, [mutateAsync, router, refreshToken]);

  return <div>Logout...</div>;
}
