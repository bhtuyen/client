'use client';

import { useAppContext } from '@/components/app-provider';
import { checkAndRefreshToken } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const UNAUTHENTICATED_PATHS = ['/login', '/logout', '/refresh-token'];

export default function RefreshToken() {
  const pathname = usePathname();
  const { setRole } = useAppContext();
  const router = useRouter();
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return;
    let interval: NodeJS.Timeout;

    const TIMEOUT = 1000;

    checkAndRefreshToken({
      onError: () => {
        clearInterval(interval);
        setRole(undefined);
        router.push('/login');
      }
    });

    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onError: () => {
            clearInterval(interval);
            setRole(undefined);
            router.push('/login');
          }
        }),
      TIMEOUT
    );

    return () => {
      clearInterval(interval);
    };
  }, [pathname, router, setRole]);
  return null;
}
