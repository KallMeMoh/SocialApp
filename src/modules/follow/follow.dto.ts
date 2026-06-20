import z from 'zod';
import { sharedFields } from '../../common/validation/fields.js';

export const followSchema = z.object({
  body: z.object({}),

  query: z.object({
    ln: sharedFields.ln,
  }),

  params: z.object({
    userId: sharedFields.id,
  }),
});

export type FollowDTO = z.infer<typeof followSchema>;
