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
  getOrders: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      `/${prefix}?${stringify({ fromDate: queryParams.fromDate?.toISOString(), toDate: queryParams.toDate?.toISOString() })}`
    ),
  getOrderDetail: (orderId: number) => http.get<GetOrderDetailResType>(`/${prefix}/${orderId}`),
  createOrder: (body: CreateOrdersBodyType) => http.post<CreateOrdersResType>(`/${prefix}`, body),
  updateOrder: ({ orderId, body }: { orderId: number; body: UpdateOrderBodyType }) =>
    http.put<UpdateOrderResType>(`/api/${prefix}/${orderId}`, body),
  payOrder: (body: PayGuestOrdersBodyType) => http.post<PayGuestOrdersResType>(`/${prefix}/pay`, body)
};

export default orderApiRequest;
