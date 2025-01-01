/* eslint-disable no-unused-vars */
export enum Token {
  ForgotPasswordToken = 'ForgotPasswordToken',
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  TableToken = 'TableToken'
}

export enum Role {
  Owner = 'Owner',
  Employee = 'Employee',
  Guest = 'Guest'
}

export enum DishStatus {
  Available = 'Available',
  Unavailable = 'Unavailable',
  Hidden = 'Hidden'
}

export enum TableStatus {
  Available = 'Available',
  Hidden = 'Hidden',
  Reserved = 'Reserved'
}

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Rejected = 'Rejected',
  Delivered = 'Delivered',
  Paid = 'Paid'
}

export enum DishCategory {
  Buffet = 'Buffet',
  Paid = 'Paid',
  ComboBuffet = 'ComboBuffet',
  ComboPaid = 'ComboPaid'
}

export enum RouteAction {
  Create = 'create',
  Edit = 'edit'
}

export enum RowMode {
  None,
  Insert,
  Update,
  Delete
}

export enum PaymentMethod {
  Cash = 'Cash',
  Card = 'Card'
}
