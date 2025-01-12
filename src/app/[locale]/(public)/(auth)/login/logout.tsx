'use client';
import { useSearchParams } from 'next/navigation';
import { memo, useEffect, useRef } from 'react';

import { useLogoutMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import { useRouter } from '@/i18n/routing';
import { getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from '@/lib/utils';

function LogoutInner() {
  const { mutateAsync } = useLogoutMutation();
  const { setRole, disconnectSocket } = useAppStore();
  const router = useRouter();

  const ref = useRef<any>(null);

  const searchParams = useSearchParams();
  const refreshToken = searchParams?.get('refreshToken');
  const accessToken = searchParams?.get('accessToken');

  useEffect(() => {
    if (
      !ref.current &&
      ((refreshToken && refreshToken === getRefreshTokenFromLocalStorage()) || (accessToken && accessToken === getAccessTokenFromLocalStorage()))
    ) {
      ref.current = mutateAsync;
      // eslint-disable-next-line no-undef

      mutateAsync().then(() => {
        setTimeout(() => {
          ref.current = null;
        }, 1000);
        setRole(null);
        disconnectSocket();
      });
    } else if (accessToken !== getAccessTokenFromLocalStorage()) {
      router.push('/');
    }
  }, [mutateAsync, router, refreshToken, accessToken, setRole, disconnectSocket]);

  return null;
}

const Logout = memo(LogoutInner);

export default Logout;
