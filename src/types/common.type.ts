import type { GuestOrderRole } from '@/constants/const';
import type { Role } from '@/constants/enum';
import type { DishInCart } from '@/schemaValidations/dish.schema';
import type { TMessKey } from '@/types/message.type';
import type { ReactNode } from 'react';
import type { Socket } from 'socket.io-client';

export interface ShowAlertDialogOption {
  onAction: () => void;
  onCancel?: () => void;
  title?: TMessKey<'t-alert-dialog.title'>;
  description?: TMessKey<'t-alert-dialog.title'>;
  cancel?: TMessKey<'t-button'>;
  action?: TMessKey<'t-button'>;
}

export type DeleteOption = ShowAlertDialogOption;

export interface EditOption {
  urlEdit?: string;
  render?: ReactNode;
}

export type StoreType = {
  role: Role | null | typeof GuestOrderRole;
  setRole: (role: Role | null | typeof GuestOrderRole) => void;
  socket: Socket | null;
  createConnectSocket: (accessToken: string) => void;
  disconnectSocket: () => void;
  cart: DishInCart[];
  setCart: (dishes: DishInCart[]) => void;
  pushToCart: (dishes: DishInCart[]) => void;
  removeDishesFromCart: (dishIds: string[]) => void;
  changeQuantity: (dishId: string, quantity: number) => void;
  removeAllCart: () => void;
  isShowAlertDialog: boolean;
  optionAlertDialog: ShowAlertDialogOption;
  showAlertDialog: (option: ShowAlertDialogOption) => void;
  closeAlertDialog: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};
