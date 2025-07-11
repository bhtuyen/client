import type {
  CreateTable,
  ModeBuffet,
  TableDtoDetailRes,
  TableDtoDetailsRes,
  TableRes,
  TablesRes,
  UpdateTable
} from '@/schemaValidations/table.schema';

import http from '@/lib/http';

const prefix = '/tables';

export const tableApiRequets = {
  getAll: () => http.get<TablesRes>(`${prefix}`),
  getById: (id: string) => http.get<TableRes>(`${prefix}/${id}`),
  create: (body: CreateTable) => http.post<TableRes>(`${prefix}`, body),
  update: (body: UpdateTable) => http.put<TableRes>(`${prefix}/${body.id}`, body),
  updateBuffetMode: (body: ModeBuffet) => http.put<TableRes>(`${prefix}/buffet-mode`, body),
  delete: (id: string) => http.delete<TableRes>(`${prefix}/${id}`),
  getTablesDetailNow: () => http.get<TableDtoDetailsRes>(`${prefix}/detail-now`),
  getTableDetailNow: (tableNumber: string) => http.get<TableDtoDetailRes>(`${prefix}/detail-now/${tableNumber}`),
  getTableDetailForPayment: (tableNumber: string) => http.get<TableDtoDetailRes>(`${prefix}/detail-payment/${tableNumber}`),
  resetTable: (tableNumber: string) => http.post<TableRes>(`${prefix}/reset`, { tableNumber })
};
