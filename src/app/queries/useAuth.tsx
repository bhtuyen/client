import { useMutation } from '@tanstack/react-query';

import authApiRequest from '@/app/apiRequests/auth';

export const useLoginMutation = () =>
  useMutation({
    mutationFn: authApiRequest.login
  });

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: authApiRequest.logout
  });

export const useSetCookieOauthMutation = () =>
  useMutation({
    mutationFn: authApiRequest.setCookieOauth
  });
