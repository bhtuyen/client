import { DishInCartType } from '@/schemaValidations/dish.schema';
import { RoleType } from '@/types/jwt.types';
import { TMessKey } from '@/types/message.type';
import { Socket } from 'socket.io-client';
export interface ShowAlertDialogOption {
  onAction: () => void;
  onCancel?: () => void;
  title?: TMessKey<'t-alert-dialog.title'>;
  description?: TMessKey<'t-alert-dialog.title'>;
  cancel?: TMessKey<'t-button'>;
  action?: TMessKey<'t-button'>;
}

export interface DeleteOption extends ShowAlertDialogOption {}

export interface EditOption {
  urlEdit: string;
}

export type StoreType = {
  role: RoleType | null;
  setRole: (role: RoleType | null) => void;
  socket: Socket | null;
  createConnectSocket: (accessToken: string) => void;
  disconnectSocket: () => void;
  cart: DishInCartType[];
  pushToCart: (dish: DishInCartType) => void;
  removeDishFromCart: (dishId: string) => void;
  changeQuantity: (dishId: string, quantity: number) => void;
  removeAllCart: () => void;
  isShowAlertDialog: boolean;
  optionAlertDialog: ShowAlertDialogOption;
  showAlertDialog: (option: ShowAlertDialogOption) => void;
  closeAlertDialog: () => void;
};
