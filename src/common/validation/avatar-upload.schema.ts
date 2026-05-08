import { z } from 'zod';
import { ln } from './fields.js';

export const avatarUploadSchema = z.object({
  body: z.object({
    fileType: z.enum(['image/jpeg', 'image/png', 'image/jpg', 'image/gif']),
  }),

  query: z.object({ ln }),

  params: z.object({}),
});

export type AvatarUploadDTO = z.infer<typeof avatarUploadSchema>;
