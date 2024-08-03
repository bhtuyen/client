import http from '@/lib/http';
import { CreateDishBodyType, DishListResType, DishResType, UpdateDishBodyType } from '@/schemaValidations/dish.schema';

const prefix = '/dishes';

export const dishApiRequets = {
  getAll: () => http.get<DishListResType>(`${prefix}`),
  getById: (id: number) => http.get<DishResType>(`${prefix}/${id}`),
  create: (body: CreateDishBodyType) => http.post<DishResType>(`${prefix}`, body),
  update: (id: number, body: UpdateDishBodyType) => http.put<DishResType>(`${prefix}/${id}`, body),
  delete: (id: number) => http.delete<DishResType>(`${prefix}/${id}`)
};
