import guestApiRequest from '@/app/apiRequests/guest';
import { useMutation } from '@tanstack/react-query';

export const useGuestLoginMutation = () =>
  useMutation({
    mutationFn: guestApiRequest.login
  });

export const useGuestLogoutMutation = () =>
  useMutation({
    mutationFn: guestApiRequest.logout
  });
