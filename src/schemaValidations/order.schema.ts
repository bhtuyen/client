import z from 'zod';

import { OrderStatus, TableStatus } from '@/constants/enum';
import { accountDto } from '@/schemaValidations/account.schema';
import { buildReply, id, updateAndCreate } from '@/schemaValidations/common.schema';
import { dishDtoDetailChoose, dishSnapshotDto } from '@/schemaValidations/dish.schema';
import { guestDto } from '@/schemaValidations/guest.schema';

const table = z
  .object({
    number: z.string().trim().min(1).max(50),
    capacity: z.coerce.number().positive().min(1).max(20),
    status: z.nativeEnum(TableStatus),
    token: z.string()
  })
  .merge(updateAndCreate)
  .merge(id);
export const tableDto = table.omit({
  createdAt: true,
  updatedAt: true
});
const order = z
  .object({
    guestId: z.string().uuid().nullable(),
    tableNumber: z.string().trim().min(1).max(50),
    token: z.string(),
    dishSnapshotId: z.string().uuid(),
    options: z.string().nullable(),
    quantity: z.number().min(1).max(20),
    orderHandlerId: z.string().uuid().nullable(),
    status: z.nativeEnum(OrderStatus)
  })
  .merge(updateAndCreate)
  .merge(id);
export const orderDto = order;
export const orderDtoDetail = orderDto.extend({
  guest: guestDto.nullable(),
  table: tableDto,
  orderHandler: accountDto.nullable(),
  dishSnapshot: dishSnapshotDto
});
export const updateOrder = orderDto
  .pick({
    status: true,
    quantity: true,
    options: true,
    orderHandlerId: true,
    id: true
  })
  .merge(
    z.object({
      dishId: z.string().uuid()
    })
  );
export const orderDtoDetailRes = buildReply(orderDtoDetail);
export const ordersDtoDetailRes = buildReply(z.array(orderDtoDetail));
export const guestPayOrders = z.object({
  tableNumber: z.string().trim().min(1).max(50)
});
export const dishToOrder = z.object({
  dishId: z.string().uuid(),
  quantity: z.number(),
  options: z.string().optional()
});
export const createOrdersTable = z.object({
  tableNumber: z.string().trim().min(1).max(50),
  dishes: z.array(dishToOrder)
});

export const createOrdersTableForm = z.object({
  tableNumber: z.string().trim().min(1).max(50),
  dishes: z.array(dishDtoDetailChoose)
});

export type DishToOrder = z.TypeOf<typeof dishToOrder>;
export type UpdateOrder = z.TypeOf<typeof updateOrder>;
export type CreateOrdersTable = z.TypeOf<typeof createOrdersTable>;
export type OrderDtoDetailRes = z.TypeOf<typeof orderDtoDetailRes>;
export type OrdersDtoDetailRes = z.TypeOf<typeof ordersDtoDetailRes>;
export type OrderDtoDetail = z.TypeOf<typeof orderDtoDetail>;
export type GuestPayOrders = z.TypeOf<typeof guestPayOrders>;

export type CreateOrdersTableForm = z.TypeOf<typeof createOrdersTableForm>;
