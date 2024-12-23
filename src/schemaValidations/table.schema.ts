import z from 'zod';

import { buildReply } from '@/schemaValidations/common.schema';
import { guestDto } from '@/schemaValidations/guest.schema';
import { orderDtoDetail, tableDto } from '@/schemaValidations/order.schema';

/**
 * Schema
 */

export const createTable = tableDto.omit({ token: true, id: true });
export const tableRes = buildReply(tableDto);
export const tablesRes = buildReply(z.array(tableDto));
export const updateTable = tableDto.omit({ token: true }).extend({ changeToken: z.boolean() });

export const tableDtoDetail = tableDto.extend({
  orders: z.array(orderDtoDetail),
  guests: z.array(guestDto)
});
export const tableDtoDetailsRes = buildReply(z.array(tableDtoDetail));

export const tableDtoDetailRes = buildReply(tableDtoDetail);

/**
 * Type
 */
export type TableRes = z.TypeOf<typeof tableRes>;
export type CreateTable = z.TypeOf<typeof createTable>;
export type TablesRes = z.TypeOf<typeof tablesRes>;
export type UpdateTable = z.TypeOf<typeof updateTable>;
export type TableDto = z.TypeOf<typeof tableDto>;
export type TableDtoDetailsRes = z.TypeOf<typeof tableDtoDetailsRes>;
export type TableDtoDetailRes = z.TypeOf<typeof tableDtoDetailRes>;
export type TableDtoDetail = z.TypeOf<typeof tableDtoDetail>;
