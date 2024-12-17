import z from 'zod';

import { accountDto } from '@/schemaValidations/account.schema';
import { buildReply } from '@/schemaValidations/common.schema';

export const token = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string()
  })
  .strict();
export const login = accountDto
  .pick({
    email: true
  })
  .extend({
    password: z.string().min(6).max(100)
  })
  .strict();
export const loginRes = buildReply(
  z
    .object({
      account: accountDto
    })
    .merge(token)
);
export const refreshTokenRes = buildReply(token);
export const logout = token.pick({ refreshToken: true });
export const loginGoogle = z.object({
  code: z.string()
});
export const refreshToken = token.pick({ refreshToken: true });

export type Token = z.TypeOf<typeof token>;
export type Login = z.TypeOf<typeof login>;
export type Logout = z.TypeOf<typeof logout>;
export type LoginRes = z.TypeOf<typeof loginRes>;
export type LoginGoogle = z.TypeOf<typeof loginGoogle>;
export type RefreshToken = z.TypeOf<typeof refreshToken>;
export type RefreshTokenRes = z.TypeOf<typeof refreshTokenRes>;
