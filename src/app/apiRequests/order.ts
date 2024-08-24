import http from '@/lib/http';
import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType
} from '@/schemaValidations/order.schema';

const prefix = 'orders';

const orderApiRequest = {
  getOrders: () => http.get<GetOrdersResType>(`/api/${prefix}`),
  getOrder: (orderId: number) => http.get<GetOrderDetailResType>(`/api/${prefix}/${orderId}`),
  createOrder: (body: CreateOrdersBodyType) => http.post<CreateOrdersResType>(`/api/${prefix}`, body),
  updateOrder: ({ orderId, body }: { orderId: number; body: UpdateOrderBodyType }) =>
    http.put<UpdateOrderResType>(`/api/${prefix}/${orderId}`, body),
  payOrder: (body: PayGuestOrdersBodyType) => http.post<PayGuestOrdersResType>(`/api/${prefix}/pay`, body)
};

export default orderApiRequest;
