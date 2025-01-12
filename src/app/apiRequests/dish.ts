import type {
  CreateDishCombo,
  CreateDishGroup,
  DishChooseBody,
  DishDtoComboDetailRes,
  DishDtoComboDetailsRes,
  DishDtoDetailChooseRes,
  DishGroupRes,
  DishGroupsRes,
  DishesRes,
  UpdateDishCombo
} from '@/schemaValidations/dish.schema';

import http from '@/lib/http';

const prefix = '/dishes';

export const dishApiRequets = {
  // Note: nextjs 15 default cache is 'no-cache'
  // Note: nextjs 14 default cache is 'force-cache'
  getAll: () => http.get<DishesRes>(`${prefix}`, { next: { tags: ['dishes'] } }),
  getById: (id: string) => http.get<DishDtoComboDetailRes>(`${prefix}/${id}`),
  getToChoose: (body: DishChooseBody) => http.post<DishDtoDetailChooseRes>(`${prefix}/choose`, body),
  getToOrder: () => http.get<DishDtoComboDetailsRes>(`${prefix}/order`),
  getDishBuffet: (dishBuffetId: string | null) => http.get<DishDtoComboDetailsRes>(`${prefix}/buffet/${dishBuffetId}`),
  create: (body: CreateDishCombo) => http.post<DishDtoComboDetailRes>(`${prefix}`, body),
  update: (body: UpdateDishCombo) => http.put<DishDtoComboDetailRes>(`${prefix}/${body.id}`, body),
  delete: (id: string) => http.delete<DishDtoComboDetailRes>(`${prefix}/${id}`),
  getGroups: () => http.get<DishGroupsRes>(`${prefix}/groups`, { next: { tags: ['dish-groups'] } }),
  createGroup: (body: CreateDishGroup) => http.post<DishGroupRes>(`${prefix}/group`, body)
};
