import { OrderStatus } from '@/constants/enum';
import { buildSelect } from '@/lib/utils';
import { accountDto } from '@/schemaValidations/account.schema';
import { buildReply, id, updateAndCreate } from '@/schemaValidations/common.schema';
import { dishSnapshotDto } from '@/schemaValidations/dish.schema';
import { tableDto } from '@/schemaValidations/table.schema';
import z from 'zod';

const order = z
  .object({
    guestId: z.string().uuid(),
    tableNumber: z.string().trim().min(1).max(50),
    dishSnapshotId: z.string().uuid(),
    options: z.string().optional(),
    quantity: z.number().min(1).max(20),
    orderHandlerId: z.string().uuid().optional(),
    status: z.nativeEnum(OrderStatus)
  })
  .merge(updateAndCreate)
  .merge(id);

/**
 * Guest schema
 */
const guest = z
  .object({
    tableNumber: z.string().trim().min(1).max(50),
    refreshToken: z.string().nullable(),
    refreshTokenExpiresAt: z.date().nullable()
  })
  .merge(updateAndCreate)
  .merge(id);

export const guestDto = guest.pick({
  id: true,
  tableNumber: true,
  createdAt: true
});

export const orderDto = order;

export type OrderDto = z.TypeOf<typeof orderDto>;

export const orderDtoDetail = orderDto.extend({
  guest: guestDto,
  table: tableDto,
  orderHandler: accountDto.optional(),
  dishSnapshot: dishSnapshotDto
});

export type OrderDtoDetail = z.TypeOf<typeof orderDtoDetail>;

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
  )
  .strict();

export type UpdateOrder = z.TypeOf<typeof updateOrder>;

export const orderDtoDetailRes = buildReply(orderDtoDetail);

export type OrderDtoDetailRes = z.TypeOf<typeof orderDtoDetailRes>;

export const selectOrderDtoDetail = buildSelect<OrderDtoDetail>();

export const selectOrderDto = buildSelect<OrderDto>();

export const ordersDtoDetailRes = buildReply(z.array(orderDtoDetail));

export type OrdersDtoDetailRes = z.TypeOf<typeof ordersDtoDetailRes>;

export const guestPayOrders = z.object({
  guestId: z.string().uuid()
});

export type GuestPayOrders = z.TypeOf<typeof guestPayOrders>;

export const createOrder = z.object({
  dishId: z.string().uuid(),
  quantity: z.number(),
  options: z.string().optional()
});

export type CreateOrder = z.TypeOf<typeof createOrder>;

export const createOrders = z
  .object({
    guestId: z.string().uuid(),
    orders: z.array(createOrder)
  })
  .strict();

export type CreateOrders = z.TypeOf<typeof createOrders>;
