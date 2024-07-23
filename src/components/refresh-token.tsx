"use client";

import { checkAndRefreshToken } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const UNAUTHENTICATED_PATHS = ["/login", "/logout", "/refresh-token"];

export type jwtPayload = {
  exp: number;
  iat: number;
};
export default function RefreshToken() {
  const pathname = usePathname();
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return;
    let interval: NodeJS.Timeout;

    const TIMEOUT = 1000;

    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval);
      },
    });

    interval = setInterval(checkAndRefreshToken, TIMEOUT);

    return () => {
      clearInterval(interval);
    };
  }, [pathname]);
  return null;
}
