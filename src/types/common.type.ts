import { DishInCartType } from '@/schemaValidations/dish.schema';
import { RoleType } from '@/types/jwt.types';
import { TMessageOption } from '@/types/message.type';
import { Socket } from 'socket.io-client';
export interface ShowAlertDialogOption {
  onAction: () => void;
  onCancel?: () => void;
  title: TMessageOption<'alert-dialog.title'>;
  description: TMessageOption<'alert-dialog.description'>;
  cancel: TMessageOption<'button'>;
  action: TMessageOption<'button'>;
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
