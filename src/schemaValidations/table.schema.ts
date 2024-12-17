import z from 'zod';

import { TableStatus } from '@/constants/enum';
import { buildReply, id, updateAndCreate } from '@/schemaValidations/common.schema';

/**
 * Schema
 */
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
export const createTable = tableDto.omit({ token: true, id: true });
export const tableRes = buildReply(tableDto);
export const tablesRes = buildReply(z.array(tableDto));
export const updateTable = tableDto.omit({ token: true }).extend({ changeToken: z.boolean() });

/**
 * Type
 */
export type TableRes = z.TypeOf<typeof tableRes>;
export type CreateTable = z.TypeOf<typeof createTable>;
export type TablesRes = z.TypeOf<typeof tablesRes>;
export type UpdateTable = z.TypeOf<typeof updateTable>;

export type TableDto = z.TypeOf<typeof tableDto>;
