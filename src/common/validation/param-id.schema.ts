import z from 'zod';
import { ln, id } from './fields.js';

export const paramIdSchema = z.object({
  body: z.object({}),

  query: z.object({ ln }),

  params: z.object({ userId: id }),
});

export type ParamIDDTO = z.infer<typeof paramIdSchema>;
