'use client';

import { useEffect } from 'react';

import { useLogoutMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import { usePathname, useRouter } from '@/i18n/routing';
import { handleErrorApi } from '@/lib/utils';

const UNAUTHENTICATED_PATHS = ['/login', '/logout', '/refresh-token'];

export default function ListenLogoutSocket() {
  const pathname = usePathname();
  const { setRole, socket, disconnectSocket } = useAppStore();
  const router = useRouter();

  const { isPending, mutateAsync } = useLogoutMutation();

  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return;

    async function onLogout() {
      if (isPending) return;

      try {
        await mutateAsync();
        setRole(null);
        disconnectSocket();
        router.push('/');
      } catch (error) {
        handleErrorApi({ error });
      }
    }

    socket?.on('logout', onLogout);

    return () => {
      socket?.off('logout', onLogout);
    };
  }, [pathname, router, setRole, socket, disconnectSocket, isPending, mutateAsync]);
  return null;
}
