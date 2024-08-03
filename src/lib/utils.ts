import authApiRequest from '@/app/apiRequests/auth';
import { toast } from '@/components/ui/use-toast';
import envConfig from '@/config';
import { DishStatus, OrderStatus, TableStatus } from '@/constants/type';
import { EntityError } from '@/lib/http';
import { type ClassValue, clsx } from 'clsx';
import { decode } from 'jsonwebtoken';
import { BookX, CookingPot, HandCoins, Loader, Truck } from 'lucide-react';
import { UseFormSetError } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { TokenPayload } from '@/types/jwt.types';

const isBrowser = typeof window !== 'undefined';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleErrorApi = ({
  error,
  setError,
  duration
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((error) => {
      setError(error.field, {
        type: 'server',
        message: error.message
      });
    });
  } else {
    toast({
      title: 'Error',
      description: error?.payload?.message ?? 'An error occurred',
      variant: 'destructive',
      duration: duration ?? 5000
    });
  }
};
export const normalizePath = (path: string) => (path.startsWith('/') ? path.slice(1) : path);

export const decodeJWT = <Payload = TokenPayload>(token: string): Payload => {
  return decode(token) as Payload;
};

export const getAccessTokenFromLocalStorage = () => (isBrowser ? localStorage.getItem('accessToken') : null);

export const removeAccessTokenFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem('accessToken');
  }
};

export const getRefreshTokenFromLocalStorage = () => (isBrowser ? localStorage.getItem('refreshToken') : null);

export const removeRefreshTokenFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem('refreshToken');
  }
};

export const setAccessTokenToLocalStorage = (token: string) => {
  if (isBrowser) {
    localStorage.setItem('accessToken', token);
  }
};

export const setRefreshTokenToLocalStorage = (token: string) => {
  if (isBrowser) {
    localStorage.setItem('refreshToken', token);
  }
};

export const removeAuthTokens = () => {
  removeAccessTokenFromLocalStorage();
  removeRefreshTokenFromLocalStorage();
};

export const checkAndRefreshToken = async (param?: { onError?: () => void; onSuccess?: () => void }) => {
  const accessToken = getAccessTokenFromLocalStorage();
  const refreshToken = getRefreshTokenFromLocalStorage();
  if (!accessToken || !refreshToken) return;

  const accessTokenPayload = decodeJWT(accessToken);
  const refreshTokenPayload = decodeJWT(refreshToken);

  const now = new Date().getTime() / 1000 - 1;

  // check if refresh token is expired -> logout
  if (refreshTokenPayload.exp <= now) {
    removeAuthTokens();
    param?.onError && param.onError();
    return;
  }

  if (accessTokenPayload.exp - now < (accessTokenPayload.exp - accessTokenPayload.iat) / 3) {
    // refresh token
    try {
      const res = await authApiRequest.refreshToken();
      const { accessToken, refreshToken } = res.payload.data;
      setAccessTokenToLocalStorage(accessToken);
      setRefreshTokenToLocalStorage(refreshToken);
      param?.onSuccess && param.onSuccess();
    } catch (error) {
      param?.onError && param.onError();
    }
  }
};

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(number);
};

export const getVietnameseDishStatus = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Available:
      return 'Có sẵn';
    case DishStatus.Unavailable:
      return 'Không có sẵn';
    default:
      return 'Ẩn';
  }
};

export const getVietnameseOrderStatus = (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
  switch (status) {
    case OrderStatus.Delivered:
      return 'Đã phục vụ';
    case OrderStatus.Paid:
      return 'Đã thanh toán';
    case OrderStatus.Pending:
      return 'Chờ xử lý';
    case OrderStatus.Processing:
      return 'Đang nấu';
    default:
      return 'Từ chối';
  }
};

export const getVietnameseTableStatus = (status: (typeof TableStatus)[keyof typeof TableStatus]) => {
  switch (status) {
    case TableStatus.Available:
      return 'Có sẵn';
    case TableStatus.Reserved:
      return 'Đã đặt';
    default:
      return 'Ẩn';
  }
};

export const getTableLink = ({ token, tableNumber }: { token: string; tableNumber: number }) => {
  return envConfig.NEXT_PUBLIC_URL + '/tables/' + tableNumber + '?token=' + token;
};

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(removeAccents(matchText.trim().toLowerCase()));
};

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss dd/MM/yyyy');
};

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss');
};

export const OrderStatusIcon = {
  [OrderStatus.Pending]: Loader,
  [OrderStatus.Processing]: CookingPot,
  [OrderStatus.Rejected]: BookX,
  [OrderStatus.Delivered]: Truck,
  [OrderStatus.Paid]: HandCoins
};
