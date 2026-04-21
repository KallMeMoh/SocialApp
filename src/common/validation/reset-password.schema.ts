import { z } from 'zod';
import { password, ln } from './fields.js';

export const resetPasswordSchema = z.object({
  body: z
    .object({
      new_password: password,
      confirm_new_password: password,
    })
    .refine((data) => data.new_password === data.confirm_new_password, {
      message: 'Passwords do not match',
      path: ['confirm_password'],
    }),

  query: z.object({ ln }),

  params: z.object({
    token: z.string().regex(/^[A-Za-z0-9]{64}$/, {
      error: 'Malformed token',
    }),
  }),
});
