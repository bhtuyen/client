import type { GuestOrderRole } from '@/constants/const';
import type { Role, Token } from '@/constants/enum';
import type { JwtPayload } from 'jsonwebtoken';

export type TokenPayload = JwtPayload & {
  type: Token;
  exp: number;
  iat: number;
} & DataPayload;

export type DataPayload =
  | {
      tableNumber: string;
      tableToken: string;
      guestId: string;
      role: typeof GuestOrderRole;
    }
  | {
      accountId: string;
      role: Role;
    };

export interface TableTokenPayload {
  iat: number;
  number: number;
  token: Token;
}
