'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useSetCookieOauthMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import { toast } from '@/hooks/use-toast';
import { useRouter } from '@/i18n/routing';
import { decodeJWT } from '@/lib/utils';
export default function OauthGoogle() {
  const { createConnectSocket, setRole } = useAppStore();

  const { mutateAsync } = useSetCookieOauthMutation();

  const route = useRouter();

  const counter = useRef(0);

  const searchParams = useSearchParams();
  const accessToken = searchParams?.get('accessToken');
  const refreshToken = searchParams?.get('refreshToken');
  const message = searchParams?.get('message');

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
