import type { CreateTable, TableRes, TablesRes, UpdateTable } from '@/schemaValidations/table.schema';

import http from '@/lib/http';

const prefix = '/tables';

export const tableApiRequets = {
  getAll: () => http.get<TablesRes>(`${prefix}`),
  getById: (id: string) => http.get<TableRes>(`${prefix}/${id}`),
  create: (body: CreateTable) => http.post<TableRes>(`${prefix}`, body),
  update: (body: UpdateTable) => http.put<TableRes>(`${prefix}/${body.id}`, body),
  delete: (id: string) => http.delete<TableRes>(`${prefix}/${id}`)
};
