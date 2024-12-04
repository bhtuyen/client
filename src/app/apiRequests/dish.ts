import http from '@/lib/http';
import {
  CreateDish,
  CreateDishGroupBodyType,
  DishesRes,
  DishGroupListResType,
  DishGroupResType,
  DishRes,
  UpdateDish
} from '@/schemaValidations/dish.schema';

const prefix = '/dishes';

export const dishApiRequets = {
  // Note: nextjs 15 default cache is 'no-cache'
  // Note: nextjs 14 default cache is 'force-cache'
  getAll: () => http.get<DishesRes>(`${prefix}`, { next: { tags: ['dishes'] } }),
  getById: (id: string) => http.get<DishRes>(`${prefix}/${id}`),
  create: (body: CreateDish) => http.post<DishRes>(`${prefix}`, body),
  update: (id: string, body: UpdateDish) => http.put<DishRes>(`${prefix}/${id}`, body),
  delete: (id: string) => http.delete<DishRes>(`${prefix}/${id}`),
  getGroups: () => http.get<DishGroupListResType>(`${prefix}/groups`, { next: { tags: ['dish-groups'] } }),
  createGroup: (body: CreateDishGroupBodyType) => http.post<DishGroupResType>(`${prefix}/group`, body)
};
