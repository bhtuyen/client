'use client';

import { useAppContext } from '@/components/app-provider';
import socket from '@/lib/socket';
import { checkAndRefreshToken, ParamType } from '@/lib/utils';
import { AccountType } from '@/schemaValidations/account.schema';
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

    const param: ParamType = {
      onError: () => {
        clearInterval(interval);
        setRole(undefined);
        router.push('/login');
      }
    };

    checkAndRefreshToken(param);

    interval = setInterval(() => checkAndRefreshToken(param), TIMEOUT);

    function onConnect() {
      console.log(socket.id);
    }
    function onRefreshToken(data: AccountType) {
      const newParam: ParamType = {
        ...param,
        onSuccess: () => {
          setRole(data.role);
        },
        force: true
      };
      checkAndRefreshToken(newParam);
    }
    function onDisconnect() {
      console.log('disconnected');
    }

    socket.on('connect', onConnect);
    socket.on('refresh-token', onRefreshToken);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('refresh-token', onRefreshToken);
      socket.off('disconnect', onDisconnect);
      clearInterval(interval);
    };
  }, [pathname, router, setRole]);
  return null;
}
