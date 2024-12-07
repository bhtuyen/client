import orderApiRequest from '@/app/apiRequests/order';
import { Period } from '@/schemaValidations/common.schema';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useOrderListQuery = (queryParam: Period) =>
  useQuery({
    queryKey: ['orders', queryParam],
    queryFn: () => orderApiRequest.getOrders(queryParam)
  });

export const useOrderQuery = (orderId: string) =>
  useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApiRequest.getOrderDetail(orderId)
  });

export const useCreateOrderMutation = () =>
  useMutation({
    mutationFn: orderApiRequest.createOrder
  });

export const useUpdateOrderMutation = () =>
  useMutation({
    mutationFn: orderApiRequest.updateOrder
  });

export const usePayOrderMutation = () => {
  return useMutation({
    mutationFn: orderApiRequest.payOrder
  });
};
