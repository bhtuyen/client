import http from '@/lib/http';
import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType
} from '@/schemaValidations/order.schema';
import { stringify } from 'querystring';

const prefix = 'orders';

const orderApiRequest = {
  getOrders: ({ fromDate, toDate }: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      `/${prefix}?${stringify({ fromDate: fromDate?.toISOString(), toDate: toDate?.toISOString() })}`
    ),
  getOrderDetail: (orderId: string) => http.get<GetOrderDetailResType>(`/${prefix}/${orderId}`),
  createOrder: (body: CreateOrdersBodyType) => http.post<CreateOrdersResType>(`/${prefix}`, body),
  updateOrder: ({ orderId, body }: { orderId: string; body: UpdateOrderBodyType }) =>
    http.put<UpdateOrderResType>(`/${prefix}/${orderId}`, body),
  payOrder: (body: PayGuestOrdersBodyType) => http.post<PayGuestOrdersResType>(`/${prefix}/pay`, body)
};

export default orderApiRequest;
