import http from '@/lib/http';
import { CreateDishBodyType, DishListResType, DishResType, UpdateDishBodyType } from '@/schemaValidations/dish.schema';

const prefix = '/dishes';

export const dishApiRequets = {
  // Note: nextjs 15 default cache is 'no-cache'
  // Note: nextjs 14 default cache is 'force-cache'
  getAll: () => http.get<DishListResType>(`${prefix}`, { next: { tags: ['dishes'] } }),
  getById: (id: number) => http.get<DishResType>(`${prefix}/${id}`),
  create: (body: CreateDishBodyType) => http.post<DishResType>(`${prefix}`, body),
  update: (id: number, body: UpdateDishBodyType) => http.put<DishResType>(`${prefix}/${id}`, body),
  delete: (id: number) => http.delete<DishResType>(`${prefix}/${id}`)
};
