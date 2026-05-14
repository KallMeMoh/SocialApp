import z from 'zod';
import { ln, id } from './fields.js';

export const userIdSchema = z.object({
  body: z.object({}),

  query: z.object({ ln }),

  params: z.object({ userId: id }),
});

export type UserIdDTO = z.infer<typeof userIdSchema>;
