import z from 'zod';

import { token } from '@/schemaValidations/auth.schema';
import { buildReply, id, updateAndCreate } from '@/schemaValidations/common.schema';
import { orderDtoDetail } from '@/schemaValidations/order.schema';

const guest = z
  .object({
    tableNumber: z.string().trim().min(1).max(50),
    token: z.string(),
    refreshToken: z.string().nullable(),
    expiredAt: z.date().nullable()
  })
  .merge(updateAndCreate)
  .merge(id);
export const guestDto = guest.pick({
  id: true,
  tableNumber: true,
  createdAt: true,
  token: true
});
export const guestLogin = guestDto
  .pick({ tableNumber: true })
  .extend({
    token: z.string()
  })
  .strict();
export const guestLoginRes = buildReply(
  z
    .object({
      guest: guestDto
    })
    .merge(token)
);
export const guestCreateOrders = z.array(
  z.object({
    dishId: z.string().uuid(),
    quantity: z.number().min(1).max(20),
    options: z.string().optional()
  })
);
export const guestsRes = buildReply(z.array(guestDto));

export type GuestDto = z.TypeOf<typeof guestDto>;
export type GuestsRes = z.TypeOf<typeof guestsRes>;
export type GuestLogin = z.TypeOf<typeof guestLogin>;
export type GuestLoginRes = z.TypeOf<typeof guestLoginRes>;
export type GuestCreateOrders = z.TypeOf<typeof guestCreateOrders>;
