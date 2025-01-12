import { useMutation, useQuery } from '@tanstack/react-query';

import type { Period } from '@/schemaValidations/common.schema';

import guestApiRequest from '@/app/apiRequests/guest';

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

export const useCallStaffMutation = () =>
  useMutation({
    mutationFn: guestApiRequest.callStaff
  });

export const useRequestPaymentMutation = () =>
  useMutation({
    mutationFn: guestApiRequest.requestPayment
  });
export const useGetGuestsQuery = (queryParam: Period) => {
  return useQuery({
    queryKey: ['guests', queryParam],
    queryFn: () => guestApiRequest.getGuests(queryParam)
  });
};
