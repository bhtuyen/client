import http from '@/lib/http';
import { CreateTable, TableRes, TablesRes, UpdateTable } from '@/schemaValidations/table.schema';

const prefix = '/tables';

export const tableApiRequets = {
  getAll: () => http.get<TablesRes>(`${prefix}`),
  getById: (id: string) => http.get<TableRes>(`${prefix}/${id}`),
  create: (body: CreateTable) => http.post<TableRes>(`${prefix}`, body),
  update: ({ number, ...body }: UpdateTable) => http.put<TableRes>(`${prefix}/${number}`, body),
  delete: (id: string) => http.delete<TableRes>(`${prefix}/${id}`)
};
