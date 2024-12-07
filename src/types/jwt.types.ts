import type { Role, Token } from '@/constants/enum';
import type { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  userId: number;
  role: Role;
  type: Token;
  exp: number;
  iat: number;
}

export interface TableTokenPayload {
  iat: number;
  number: number;
  token: Token;
}
