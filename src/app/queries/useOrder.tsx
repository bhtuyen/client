import orderApiRequest from '@/app/apiRequests/order';
import { CreateOrdersBodyType } from '@/schemaValidations/order.schema';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useOrderListQuery = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: orderApiRequest.getOrders
  });

export const useOrderQuery = (orderId: number) =>
  useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApiRequest.getOrder(orderId)
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
