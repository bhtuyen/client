'use client';
import { useLogoutMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import SearchParamsLoader, { useSearchParamsLoader } from '@/components/search-params-loader';
import { useRouter } from '@/i18n/routing';
import { getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export default function Logout() {
  const { mutateAsync } = useLogoutMutation();
  const { setRole, disconnectSocket } = useAppStore();
  const router = useRouter();

  const ref = useRef<any>(null);

  const { searchParams, setSearchParams } = useSearchParamsLoader();
  const refreshToken = searchParams?.get('refreshToken');
  const accessToken = searchParams?.get('accessToken');

  useEffect(() => {
    if (ref.current || (refreshToken && refreshToken !== getRefreshTokenFromLocalStorage()) || (accessToken && accessToken !== getAccessTokenFromLocalStorage())) {
      router.push('/');
      return;
    }

    ref.current = mutateAsync;
    let timer: NodeJS.Timeout;
    mutateAsync().then(() => {
      timer = setTimeout(() => {
        ref.current = null;
      }, 1000);
      setRole(null);
      disconnectSocket();
      router.push('/login');
    });

    return () => {
      clearTimeout(timer);
    };
  }, [mutateAsync, router, refreshToken, accessToken, setRole, disconnectSocket]);

  return <SearchParamsLoader onParamsReceived={setSearchParams} />;
}
