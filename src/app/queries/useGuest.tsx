import guestApiRequest from '@/app/apiRequests/guest';
import { Period } from '@/schemaValidations/common.schema';
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

export const useGuestOrdersQuery = () =>
  useQuery({
    queryKey: ['guest-orders'],
    queryFn: guestApiRequest.getOrders
  });

export const useCreateGuestMutation = () => {
  return useMutation({
    mutationFn: guestApiRequest.createGuest
  });
};

export const useGetGuestsQuery = (queryParam: Period) => {
  return useQuery({
    queryKey: ['guests', queryParam],
    queryFn: () => guestApiRequest.getGuests(queryParam)
  });
};
