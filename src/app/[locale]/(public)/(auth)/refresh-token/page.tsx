'use client';
import { useRouter } from '@/i18n/routing';
import { checkAndRefreshToken, getRefreshTokenFromLocalStorage } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function _RefreshToken() {
  const router = useRouter();

  const searchParam = useSearchParams();
  const refreshToken = searchParam.get('refreshToken');
  const redirectPathname = searchParam.get('redirect');

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

  return <div>Refresh token...</div>;
}

export default function RefreshTokenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <_RefreshToken />
    </Suspense>
  );
}
