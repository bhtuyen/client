import http from '@/lib/http';
import {
  AccountRes,
  AccountsRes,
  ChangePassword,
  CreateEmployee,
  UpdateEmployee,
  UpdateMe
} from '@/schemaValidations/account.schema';

const prefix = '/accounts';

const accountApiRequest = {
  getMe: () => http.get<AccountRes>(`${prefix}/me`),
  updateMe: (body: UpdateMe) => http.put<AccountRes>(`${prefix}/me`, body),
  changePassword: (body: ChangePassword) => http.put<AccountRes>(`${prefix}/change-password`, body),
  list: () => http.get<AccountsRes>(`${prefix}`),
  addEmployee: (body: CreateEmployee) => http.post<AccountRes>(`${prefix}`, body),
  updateEmployee: ({ id, ...body }: UpdateEmployee) => http.put<AccountRes>(`${prefix}/detail/${id}`, body),
  getEmployee: (id: string) => http.get<AccountRes>(`${prefix}/detail/${id}`),
  deleteEmployee: (id: string) => http.delete<AccountRes>(`${prefix}/detail/${id}`)
};

export default accountApiRequest;
