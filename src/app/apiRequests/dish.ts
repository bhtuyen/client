import http from '@/lib/http';
import type {
  CreateDish,
  CreateDishGroup,
  DishGroupRes,
  DishGroupsRes,
  DishRes,
  DishesRes,
  UpdateDish
} from '@/schemaValidations/dish.schema';

const prefix = '/dishes';

export const dishApiRequets = {
  // Note: nextjs 15 default cache is 'no-cache'
  // Note: nextjs 14 default cache is 'force-cache'
  getAll: () => http.get<DishesRes>(`${prefix}`, { next: { tags: ['dishes'] } }),
  getById: (id: string) => http.get<DishRes>(`${prefix}/${id}`),
  create: (body: CreateDish) => http.post<DishRes>(`${prefix}`, body),
  update: (body: UpdateDish) => http.put<DishRes>(`${prefix}/${body.id}`, body),
  delete: (id: string) => http.delete<DishRes>(`${prefix}/${id}`),
  getGroups: () => http.get<DishGroupsRes>(`${prefix}/groups`, { next: { tags: ['dish-groups'] } }),
  createGroup: (body: CreateDishGroup) => http.post<DishGroupRes>(`${prefix}/group`, body)
};
