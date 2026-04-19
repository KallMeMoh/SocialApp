import z from 'zod';
import { email, ln, password, username } from './fields.js';

export const signupSchema = z.object({
  body: z
    .object({
      username,
      email,
      password,
      confirm_password: password,
    })
    .refine((data) => data.password === data.confirm_password, {
      message: 'Passwords do not match',
      path: ['confirm_password'],
    }),

  query: z.object({ ln }),

  params: z.object({}),
});
