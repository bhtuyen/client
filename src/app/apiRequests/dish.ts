import { DishCategory } from '@/constants/enum';
import http from '@/lib/http';
import type { CreateDishCombo, CreateDishGroup, DishDtoComboDetailRes, DishDtoDetailChooseRes, DishGroupRes, DishGroupsRes, DishesRes, UpdateDishCombo } from '@/schemaValidations/dish.schema';

const prefix = '/dishes';

export const dishApiRequets = {
  // Note: nextjs 15 default cache is 'no-cache'
  // Note: nextjs 14 default cache is 'force-cache'
  getAll: () => http.get<DishesRes>(`${prefix}`, { next: { tags: ['dishes'] } }),
  getById: (id: string) => http.get<DishDtoComboDetailRes>(`${prefix}/${id}`),
  getToChoose: (body: { category: DishCategory; ignores?: string[] }) => http.post<DishDtoDetailChooseRes>(`${prefix}/choose`, body),
  create: (body: CreateDishCombo) => http.post<DishDtoComboDetailRes>(`${prefix}`, body),
  update: (body: UpdateDishCombo) => http.put<DishDtoComboDetailRes>(`${prefix}/${body.id}`, body),
  delete: (id: string) => http.delete<DishDtoComboDetailRes>(`${prefix}/${id}`),
  getGroups: () => http.get<DishGroupsRes>(`${prefix}/groups`, { next: { tags: ['dish-groups'] } }),
  createGroup: (body: CreateDishGroup) => http.post<DishGroupRes>(`${prefix}/group`, body)
};
