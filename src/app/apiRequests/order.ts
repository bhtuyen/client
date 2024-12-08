import http from '@/lib/http';
import { Period } from '@/schemaValidations/common.schema';
import {
  CreateOrders,
  GuestPayOrders,
  OrderDtoDetailRes,
  OrdersDtoDetailRes,
  UpdateOrder
} from '@/schemaValidations/order.schema';

import { stringify } from 'querystring';

const prefix = 'orders';

const orderApiRequest = {
  getOrders: ({ fromDate, toDate }: Period) =>
    http.get<OrdersDtoDetailRes>(
      `/${prefix}?${stringify({ fromDate: fromDate?.toISOString(), toDate: toDate?.toISOString() })}`
    ),
  getOrderDetail: (orderId: string) => http.get<OrderDtoDetailRes>(`/${prefix}/${orderId}`),
  createOrder: (body: CreateOrders) => http.post<OrdersDtoDetailRes>(`/${prefix}`, body),
  updateOrder: (body: UpdateOrder) => http.put<OrderDtoDetailRes>(`/${prefix}/${body.id}`, body),
  payOrder: (body: GuestPayOrders) => http.post<OrdersDtoDetailRes>(`/${prefix}/pay`, body)
};

export default orderApiRequest;
