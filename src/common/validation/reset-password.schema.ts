import { z } from 'zod';
import { password, ln, token } from './fields.js';

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

  params: z.object({ token }),
});
