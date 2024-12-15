import { DishCategory, DishStatus, RowMode } from '@/constants/enum';
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
    category: z.enum([DishCategory.Paid, DishCategory.ComboPaid, DishCategory.ComboBuffet]),
    price: z.coerce.number().positive()
  }),
  z.object({
    category: z.literal(DishCategory.Buffet),
    price: z.coerce.number().optional()
  })
]);
export const baseDishDto = baseDish.omit({ createdAt: true, updatedAt: true });
export const dishDto = baseDishDto.and(baseDishCategory);
export const dishGroup = name.merge(updateAndCreate).merge(id);
export const dishGroupDto = dishGroup.omit({ createdAt: true, updatedAt: true });
export const dishDtoDetail = baseDishDto
  .extend({
    group: dishGroupDto
  })
  .and(baseDishCategory);

export const baseDishCombo = z.object({
  dishes: z.array(
    z.object({
      dishId: z.string().uuid(),
      dish: dishDtoDetail,
      quantity: z.number().int().min(1).max(20)
    })
  ),
  combos: z.array(
    z.object({
      comboId: z.string().uuid(),
      combo: dishDtoDetail,
      quantity: z.number().int().min(1).max(20)
    })
  )
});

export const createDish = baseDishDto.omit({ id: true }).and(baseDishCategory);

export const createDishCombo = baseDishDto.omit({ id: true }).merge(baseDishCombo).and(baseDishCategory);

export const updateDish = baseDishDto.and(baseDishCategory);
export const updateDishCombo = baseDishDto
  .merge(
    baseDishCombo.extend({
      dishes: z.array(
        baseDishCombo.shape.dishes.element.extend({
          rowMode: z.nativeEnum(RowMode)
        })
      ),
      combos: z.array(
        baseDishCombo.shape.combos.element.extend({
          rowMode: z.nativeEnum(RowMode)
        })
      )
    })
  )
  .and(baseDishCategory);

export const dishDtoComboDetail = baseDishDto
  .extend({
    group: dishGroupDto,
    dishes: z.array(
      z.object({
        dishId: z.string().uuid(),
        dish: dishDtoDetail,
        quantity: z.number().int().min(1).max(20)
      })
    ),
    combos: z.array(
      z.object({
        comboId: z.string().uuid(),
        combo: dishDtoDetail,
        quantity: z.number().int().min(1).max(20)
      })
    )
  })
  .and(baseDishCategory);

export const dishDtoDetailChoose = baseDishDto
  .extend({
    group: dishGroupDto,
    quantity: z.number().int().min(1).max(20)
  })
  .and(baseDishCategory);

export const createDishGroup = dishGroupDto.pick({ name: true });
export const dishRes = buildReply(dishDtoDetail);
export const dishesRes = buildReply(z.array(dishDtoDetail));

export const dishDtoDetailChooseRes = buildReply(z.array(dishDtoDetailChoose));

export const dishGroupRes = buildReply(dishGroupDto);
export const dishGroupsRes = buildReply(z.array(dishGroupDto));
export const dishDtoComboDetailRes = buildReply(dishDtoComboDetail);
export const dishSnapshotDto = baseDishDto
  .extend({
    dishId: z.string().uuid()
  })
  .omit({ groupId: true })
  .and(baseDishCategory);

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
export type DishSnapshotDto = z.TypeOf<typeof dishSnapshotDto>;
export type CreateDishCombo = z.TypeOf<typeof createDishCombo>;
export type UpdateDishCombo = z.TypeOf<typeof updateDishCombo>;
export type DishDtoComboDetail = z.TypeOf<typeof dishDtoComboDetail>;
export type DishDtoComboDetailRes = z.TypeOf<typeof dishDtoComboDetailRes>;
export type DishDtoDetailChoose = z.TypeOf<typeof dishDtoDetailChoose>;
export type DishDtoDetailChooseRes = z.TypeOf<typeof dishDtoDetailChooseRes>;
