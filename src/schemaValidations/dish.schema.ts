import { DishCategory, DishStatus } from '@/constants/enum';
import { buildSelect } from '@/lib/utils';
import { buildReply, id, name, updateAndCreate } from '@/schemaValidations/common.schema';
import z from 'zod';

/**
 * updateMeSchema
 */
const baseDish = z
  .object({
    description: z.string().max(10000).optional(),
    groupId: z.string().uuid(),
    options: z.string().optional(),
    image: z.string().optional(),
    status: z.nativeEnum(DishStatus)
  })
  .merge(updateAndCreate)
  .merge(id)
  .merge(name);

const baseDishCategory = z.discriminatedUnion('category', [
  z.object({
    category: z.literal(DishCategory.Paid),
    price: z.coerce.number().positive()
  }),
  z.object({
    category: z.literal(DishCategory.Buffet),
    price: z.coerce.number().optional()
  })
]);

export type BaseDishCategory = z.TypeOf<typeof baseDishCategory>;

export const baseDishDto = baseDish.omit({ createdAt: true, updatedAt: true });

export const dishDto = baseDishDto.and(baseDishCategory);

export const dishGroup = name.merge(updateAndCreate).merge(id);
export const dishGroupDto = dishGroup.omit({ createdAt: true, updatedAt: true });

export const dishDtoDetail = baseDishDto
  .extend({
    group: dishGroupDto
  })
  .and(baseDishCategory);

export const createDish = baseDishDto.omit({ id: true }).and(baseDishCategory);
export const updateDish = baseDishDto.and(baseDishCategory);
export const dishRes = buildReply(dishDtoDetail);
export const dishesRes = buildReply(z.array(dishDtoDetail));
export const dishGroupRes = buildReply(dishGroupDto);
export const dishGroupsRes = buildReply(z.array(dishGroupDto));
export const createDishGroup = dishGroupDto.pick({ name: true });
export const selectDishDtoDetail = buildSelect<DishDtoDetail>();

export const selectDishDto = buildSelect<DishDto>();

export const selectDishGroupDto = buildSelect<DishGroupDto>();

export const dishSnapshotDto = baseDishDto
  .extend({
    dishId: z.string().uuid()
  })
  .and(baseDishCategory);

export type DishSnapshotDto = z.TypeOf<typeof dishSnapshotDto>;

export const dishInCart = baseDishDto
  .extend({
    quantity: z.number().min(1).max(20).default(1)
  })
  .and(baseDishCategory);

/**
 * Type
 */
export type DishDtoDetail = z.TypeOf<typeof dishDtoDetail>;
export type CreateDish = z.TypeOf<typeof createDish>;
export type UpdateDish = z.TypeOf<typeof updateDish>;
export type DishRes = z.TypeOf<typeof dishRes>;
export type DishesRes = z.TypeOf<typeof dishesRes>;
export type DishGroupRes = z.TypeOf<typeof dishGroupRes>;
export type DishGroupsRes = z.TypeOf<typeof dishGroupsRes>;
export type CreateDishGroup = z.TypeOf<typeof createDishGroup>;
export type DishDto = z.TypeOf<typeof dishDto>;
export type DishInCart = z.TypeOf<typeof dishInCart>;
export type DishGroupDto = z.TypeOf<typeof dishGroupDto>;
