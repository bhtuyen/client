import { Role, TokenType } from '@/constants/type';
import { JwtPayload } from 'jsonwebtoken';

export type TokenTypeValue = (typeof TokenType)[keyof typeof TokenType];
export type RoleType = (typeof Role)[keyof typeof Role];
export interface TokenPayload extends JwtPayload {
  userId: number;
  role: RoleType;
  tokenType: TokenTypeValue;
  exp: number;
  iat: number;
}

export interface TableTokenPayload {
  iat: number;
  number: number;
  tokenType: (typeof TokenType)['TableToken'];
}
