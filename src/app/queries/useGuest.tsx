import guestApiRequest from '@/app/apiRequests/guest';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGuestLoginMutation = () =>
  useMutation({
    mutationFn: guestApiRequest.login
  });

export const useGuestLogoutMutation = () =>
  useMutation({
    mutationFn: guestApiRequest.logout
  });

export const useGuestOrderMutation = () =>
  useMutation({
    mutationFn: guestApiRequest.orders
  });

export const useGuestOrderListQuery = () =>
  useQuery({
    queryKey: ['guest-orders'],
    queryFn: guestApiRequest.getOrders
  });
