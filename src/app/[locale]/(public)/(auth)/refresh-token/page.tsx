'use client';
import SearchParamsLoader, { useSearchParamsLoader } from '@/components/search-params-loader';
import { useRouter } from '@/i18n/routing';
import { checkAndRefreshToken, getRefreshTokenFromLocalStorage } from '@/lib/utils';
import { useEffect } from 'react';

export default function RefreshToken() {
  const router = useRouter();

  const { searchParams, setSearchParams } = useSearchParamsLoader();
  const refreshToken = searchParams?.get('refreshToken');
  const redirectPathname = searchParams?.get('redirect');

  useEffect(() => {
    if (refreshToken && refreshToken === getRefreshTokenFromLocalStorage()) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || '/');
        }
      });
    } else {
      router.push('/');
    }
  }, [router, refreshToken, redirectPathname]);

  return <SearchParamsLoader onParamsReceived={setSearchParams} />;
}
