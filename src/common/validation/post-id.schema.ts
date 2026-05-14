import z from 'zod';
import { ln, id } from './fields.js';

export const postIdSchema = z.object({
  body: z.object({}),

  query: z.object({ ln }),

  params: z.object({ postId: id }),
});

export type PostIdDTO = z.infer<typeof postIdSchema>;
