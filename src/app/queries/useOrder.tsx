import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';

import type { Period } from '@/schemaValidations/common.schema';

import orderApiRequest from '@/app/apiRequests/order';

export const useOrderByPeriodQuery = (queryParam: Period) =>
  useQuery({
    queryKey: ['orders', queryParam],
    queryFn: () => orderApiRequest.getByPeriod(queryParam)
  });

export const useOrderByTableQuery = (tableNumber: string) =>
  useQuery({
    queryKey: ['orders', tableNumber],
    queryFn: () => orderApiRequest.getByTable(tableNumber)
  });

export const useOrderDetailQuery = (orderId: string) =>
  useSuspenseQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApiRequest.getDetail(orderId)
  });

export const useCreateOrderMutation = () =>
  useMutation({
    mutationFn: orderApiRequest.creates
  });

export const useUpdateOrderMutation = () =>
  useMutation({
    mutationFn: orderApiRequest.update
  });

export const usePayOrderMutation = () => {
  return useMutation({
    mutationFn: orderApiRequest.payForTable
  });
};
