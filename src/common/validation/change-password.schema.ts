import { z } from 'zod';
import { password, ln } from './fields.js';

export const changePasswordSchema = z.object({
  body: z
    .object({
      old_password: password,
      new_password: password,
      confirm_new_password: password,
    })
    .refine((data) => data.new_password !== data.old_password, {
      message: 'New Password must be different from old password',
      path: ['new_password'],
    })
    .refine((data) => data.new_password === data.confirm_new_password, {
      message: 'Passwords do not match',
      path: ['confirm_new_password'],
    }),

  query: z.object({ ln }),

  params: z.object({}),
});
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
