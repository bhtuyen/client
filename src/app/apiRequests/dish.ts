import http from '@/lib/http';
import {
  CreateDishBodyType,
  CreateDishGroupBodyType,
  DishGroupListResType,
  DishGroupResType,
  DishListResType,
  DishResType,
  UpdateDishBodyType
} from '@/schemaValidations/dish.schema';

const prefix = '/dishes';

export const dishApiRequets = {
  // Note: nextjs 15 default cache is 'no-cache'
  // Note: nextjs 14 default cache is 'force-cache'
  getAll: () => http.get<DishListResType>(`${prefix}`, { next: { tags: ['dishes'] } }),
  getById: (id: string) => http.get<DishResType>(`${prefix}/${id}`),
  create: (body: CreateDishBodyType) => http.post<DishResType>(`${prefix}`, body),
  update: (id: string, body: UpdateDishBodyType) => http.put<DishResType>(`${prefix}/${id}`, body),
  delete: (id: string) => http.delete<DishResType>(`${prefix}/${id}`),
  getGroups: () => http.get<DishGroupListResType>(`${prefix}/groups`, { next: { tags: ['dish-groups'] } }),
  createGroup: (body: CreateDishGroupBodyType) => http.post<DishGroupResType>(`${prefix}/group`, body)
};
