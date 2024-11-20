import orderApiRequest from '@/app/apiRequests/order';
import { GetOrdersQueryParamsType, UpdateOrderBodyType } from '@/schemaValidations/order.schema';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useOrderListQuery = (queryParam: GetOrdersQueryParamsType) =>
  useQuery({
    queryKey: ['orders', queryParam],
    queryFn: () => orderApiRequest.getOrders(queryParam)
  });

export const useOrderQuery = ({ orderId, enabled }: { orderId: string; enabled: boolean }) =>
  useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApiRequest.getOrderDetail(orderId),
    enabled
  });

export const useCreateOrderMutation = () =>
  useMutation({
    mutationFn: orderApiRequest.createOrder
  });

export const useUpdateOrderMutation = () =>
  useMutation({
    mutationFn: ({ orderId, ...body }: { orderId: string } & UpdateOrderBodyType) =>
      orderApiRequest.updateOrder({ orderId, body })
  });

export const usePayOrderMutation = () => {
  return useMutation({
    mutationFn: orderApiRequest.payOrder
  });
};
