import { z } from 'zod';
import { email, ln } from './fields.js';

export const forgetPasswordSchema = z.object({
  body: z.object({ email }),

  query: z.object({ ln }),

  params: z.object({}),
});
