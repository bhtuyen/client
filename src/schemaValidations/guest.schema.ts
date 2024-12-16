import z from 'zod';

import { buildSelect } from '@/lib/utils';
import { token } from '@/schemaValidations/auth.schema';
import { buildReply } from '@/schemaValidations/common.schema';
import { guestDto, orderDtoDetail } from '@/schemaValidations/order.schema';

/**
 * Guest login
 */
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
export type GuestLogin = z.TypeOf<typeof guestLogin>;

export type GuestDto = z.TypeOf<typeof guestDto>;

export type GuestLoginRes = z.TypeOf<typeof guestLoginRes>;

export const selectGuestDto = buildSelect<GuestDto>();

/**
 * Guest create order
 */
export const guestCreateOrders = z.array(
  z.object({
    dishId: z.string().uuid(),
    quantity: z.number().min(1).max(20),
    options: z.string().optional()
  })
);
export const guestCreateOrdersRes = buildReply(z.array(orderDtoDetail));

export type GuestCreateOrders = z.TypeOf<typeof guestCreateOrders>;
export type GuestCreateOrdersRes = z.TypeOf<typeof guestCreateOrdersRes>;

export const guestsRes = buildReply(z.array(guestDto));

export type GuestsRes = z.TypeOf<typeof guestsRes>;

export const createGuest = guestDto.pick({ tableNumber: true });

export type CreateGuest = z.TypeOf<typeof createGuest>;

export const createGuestRes = buildReply(guestDto);

export type CreateGuestRes = z.TypeOf<typeof createGuestRes>;
