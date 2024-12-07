'use client';

import { useAppStore } from '@/components/app-provider';
import { usePathname, useRouter } from '@/i18n/routing';
import type { ParamType } from '@/lib/utils';
import { checkAndRefreshToken } from '@/lib/utils';
import { AccountDto } from '@/schemaValidations/account.schema';
import { useEffect } from 'react';

const UNAUTHENTICATED_PATHS = ['/login', '/logout', '/refresh-token'];

export default function RefreshToken() {
  const pathname = usePathname();
  const { setRole, socket, disconnectSocket } = useAppStore();
  const router = useRouter();
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return;
    let interval: NodeJS.Timeout;

    const TIMEOUT = 1000;

    const param: ParamType = {
      onError: () => {
        clearInterval(interval);
        disconnectSocket();
        setRole(null);

        router.push('/login');
      }
    };

    checkAndRefreshToken(param);

    interval = setInterval(() => checkAndRefreshToken(param), TIMEOUT);

    function onRefreshToken(data: AccountDto) {
      const newParam: ParamType = {
        ...param,
        onSuccess: () => {
          setRole(data.role);
        },
        force: true
      };
      checkAndRefreshToken(newParam);
    }

    socket?.on('refresh-token', onRefreshToken);

    return () => {
      socket?.off('refresh-token', onRefreshToken);
      clearInterval(interval);
    };
  }, [pathname, router, setRole, socket, disconnectSocket]);
  return null;
}
