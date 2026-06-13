import { z } from 'zod';
import {
  id,
  ln,
  otp,
  password,
  username,
  email,
} from '../../common/validation/fields.js';

export const userIdSchema = z.object({
  body: z.object({}),

  query: z.object({ ln }),

  params: z.object({ userId: id }),
});

export const userProfileSchema = z.object({
  body: z.object({}),

  query: z.object({ ln }),

  params: z.object({ username: username }),
});

export const updateUserSchema = z.object({
  body: z.object({ username, email }),

  query: z.object({ ln }),

  params: z.object({}),
});

export const oneTimePasswordSchema = z.object({
  body: z.object({ otp }),

  query: z.object({ ln }),

  params: z.object({}),
});

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

export const avatarUploadSchema = z.object({
  body: z.object({
    fileType: z.enum(['image/jpeg', 'image/png', 'image/jpg', 'image/gif']),
  }),

  query: z.object({ ln }),

  params: z.object({}),
});

export type UserIdDTO = z.infer<typeof userIdSchema>;
export type UserProfileDTO = z.infer<typeof userProfileSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type OneTimePasswordSchema = z.infer<typeof oneTimePasswordSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type AvatarUploadDTO = z.infer<typeof avatarUploadSchema>;
