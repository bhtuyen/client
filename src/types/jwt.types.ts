import { Role, Token } from '@/constants/enum';
import { JwtPayload } from 'jsonwebtoken';

export type RoleType = (typeof Role)[keyof typeof Role];
export interface TokenPayload extends JwtPayload {
  userId: number;
  role: RoleType;
  type: Token;
  exp: number;
  iat: number;
}

export interface TableTokenPayload {
  iat: number;
  number: number;
  token: Token;
}
