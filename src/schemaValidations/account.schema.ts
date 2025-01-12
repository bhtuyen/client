import z from 'zod';

import { Role } from '@/constants/enum';
import { buildReply, id, name, updateAndCreate } from '@/schemaValidations/common.schema';

const account = z
  .object({
    email: z.string().min(1, 'email-required').email('invalid-email'),
    password: z.string().min(6, 'password-required-min').max(100, 'password-max'),
    avatar: z.string().url().nullable(),
    role: z.nativeEnum(Role),
    phone: z.string().min(10, 'phone-required-min').max(15, 'phone-max').regex(/^\d+$/, 'phone-only-include-number'),
    ownerId: z.string().uuid().nullable()
  })
  .merge(updateAndCreate)
  .merge(id)
  .merge(name);

export const accountDto = account.omit({
  createdAt: true,
  updatedAt: true,
  password: true
});

export const accountsRes = buildReply(z.array(accountDto));

export const accountRes = buildReply(accountDto);
export const createEmployee = accountDto
  .pick({
    name: true,
    email: true,
    phone: true
  })
  .extend({
    confirmPassword: z.string().min(6, 'confirm-password-required-min').max(100, 'confirm-password-max'),
    password: z.string().min(6, 'password-required-min').max(100, 'password-max'),
    avatar: z.string().url().optional()
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'confirm-password-not-match',
        path: ['confirmPassword']
      });
    }
  });
export const updateEmployee = accountDto
  .pick({
    name: true,
    email: true,
    phone: true,
    id: true,
    role: true
  })
  .extend({
    changePassword: z.boolean().optional(),
    password: z.string().min(6, 'password-required-min').max(100, 'password-max').optional(),
    confirmPassword: z.string().min(6, 'password-required-min').max(100, 'password-max').optional(),
    avatar: z.string().url().optional()
  })
  .superRefine(({ confirmPassword, password, changePassword }, ctx) => {
    if (changePassword) {
      if (!password && !confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'password-required',
          path: ['password']
        });
        ctx.addIssue({
          code: 'custom',
          message: 'confirm-password-required',
          path: ['confirmPassword']
        });
      } else if (!confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'confirm-password-required',
          path: ['confirmPassword']
        });
      } else if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: 'confirm-password-not-match',
          path: ['confirmPassword']
        });
      }
    }
  });
export const updateMe = accountDto
  .pick({
    name: true
  })
  .extend({
    avatar: z.string().url().optional()
  })
  .strict();
export const changePassword = z
  .object({
    oldPassword: z.string().min(6, 'password-required-min').max(100, 'password-max'),
    password: z.string().min(6, 'password-required-min').max(100, 'password-max'),
    confirmPassword: z.string().min(6, 'password-required-min').max(100, 'password-max')
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'confirm-password-not-match',
        path: ['confirmPassword']
      });
    }
  });

export type UpdateMe = z.TypeOf<typeof updateMe>;
export type AccountRes = z.TypeOf<typeof accountRes>;
export type AccountDto = z.TypeOf<typeof accountDto>;
export type AccountsRes = z.TypeOf<typeof accountsRes>;
export type UpdateEmployee = z.TypeOf<typeof updateEmployee>;
export type CreateEmployee = z.TypeOf<typeof createEmployee>;
export type ChangePassword = z.TypeOf<typeof changePassword>;
