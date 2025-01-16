import { stringify } from 'querystring';

import type { Period } from '@/schemaValidations/common.schema';
import type { CreateOrdersTable, OrderDtoDetailRes, OrdersDtoDetailRes, UpdateOrder } from '@/schemaValidations/order.schema';

import http from '@/lib/http';

const prefix = 'orders';

const orderApiRequest = {
  getByPeriod: ({ fromDate, toDate }: Period) =>
    http.get<OrdersDtoDetailRes>(`/${prefix}?${stringify({ fromDate: fromDate?.toISOString(), toDate: toDate?.toISOString() })}`),
  getByTable: (tableNumber: string) => http.get<OrdersDtoDetailRes>(`/${prefix}/table/${tableNumber}`),
  getDetail: (orderId: string) => http.get<OrderDtoDetailRes>(`/${prefix}/${orderId}`),
  creates: (body: CreateOrdersTable) => http.post<OrdersDtoDetailRes>(`/${prefix}`, body),
  update: (body: UpdateOrder) => http.put<OrderDtoDetailRes>(`/${prefix}/${body.id}`, body)
};

export default orderApiRequest;
