import { z } from 'zod';
import { email, password, ln } from './fields.js';

export const loginSchema = z.object({
  body: z.object({ email, password }),

  query: z.object({ ln }),

  params: z.object({}),
});
