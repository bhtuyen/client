'use client';

import { useSetCookieOauthMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import { toast } from '@/components/ui/use-toast';
import { decodeJWT } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
function OauthGooglePage() {
  const { createConnectSocket, setRole } = useAppStore();

  const { mutateAsync } = useSetCookieOauthMutation();

  const route = useRouter();

  const counter = useRef(0);

  const searchParam = useSearchParams();

  const accessToken = searchParam.get('accessToken');
  const refreshToken = searchParam.get('refreshToken');
  const message = searchParam.get('message');

  useEffect(() => {
    if (accessToken && refreshToken && counter.current === 0) {
      const { role } = decodeJWT(accessToken);
      console.log(refreshToken);
      mutateAsync({ accessToken, refreshToken })
        .then(() => {
          setRole(role);
          createConnectSocket(accessToken);
          route.push('/manage/dashboard');
        })
        .catch((e) => {
          console.error(e);
          route.push('/login');
          setTimeout(() => {
            toast({
              description: e.message
            });
          });
        });
    } else if (message && counter.current === 0) {
      route.push('/login');
      setTimeout(() => {
        toast({
          description: message
        });
      });
    }
    counter.current++;
  }, [accessToken, createConnectSocket, message, refreshToken, setRole, route, mutateAsync]);

  return null;
}

export default function WrapperOauthGooglePage() {
  return (
    <Suspense>
      <OauthGooglePage />
    </Suspense>
  );
}
