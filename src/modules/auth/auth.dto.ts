import z from 'zod';
import {
  email,
  ln,
  otp,
  password,
  token,
  username,
} from '../../common/validation/fields.js';

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

export const loginSchema = z.object({
  body: z.object({ email, password }),

  query: z.object({ ln }),

  params: z.object({}),
});

export const confirmationSchema = z.object({
  body: z.object({ otp, token }),

  query: z.object({ ln }),

  params: z.object({}),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token,
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

export const forgetPasswordSchema = z.object({
  body: z.object({ email }),

  query: z.object({ ln }),

  params: z.object({}),
});

export type SignupDTO = z.infer<typeof signupSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type ConfirmationDTO = z.infer<typeof confirmationSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgetPasswordSchema>;
