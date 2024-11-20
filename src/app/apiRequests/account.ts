import http from '@/lib/http';
import {
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  CreateEmployeeAccountBodyType,
  CreateGuestBodyType,
  CreateGuestResType,
  GetGuestListQueryParamsType,
  GetListGuestsResType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType
} from '@/schemaValidations/account.schema';
import { stringify } from 'querystring';

const prefix = '/accounts';

const accountApiRequest = {
  getMe: () => http.get<AccountResType>(`${prefix}/me`),
  updateMe: (body: UpdateMeBodyType) => http.put<AccountResType>(`${prefix}/me`, body),
  changePassword: (body: ChangePasswordBodyType) => http.put<AccountResType>(`${prefix}/change-password`, body),
  list: () => http.get<AccountListResType>(`${prefix}`),
  addEmployee: (body: CreateEmployeeAccountBodyType) => http.post<AccountResType>(`${prefix}`, body),
  updateEmployee: (id: string, body: UpdateEmployeeAccountBodyType) =>
    http.put<AccountResType>(`${prefix}/detail/${id}`, body),
  getEmployee: (id: string) => http.get<AccountResType>(`${prefix}/detail/${id}`),
  deleteEmployee: (id: string) => http.delete<AccountResType>(`${prefix}/detail/${id}`),
  createGuest: (body: CreateGuestBodyType) => http.post<CreateGuestResType>(`${prefix}/guests`, body),
  getGuests: ({ fromDate, toDate }: GetGuestListQueryParamsType) =>
    http.get<GetListGuestsResType>(
      `${prefix}/guests?${stringify({ fromDate: fromDate?.toISOString(), toDate: toDate?.toISOString() })}`
    )
};

export default accountApiRequest;
