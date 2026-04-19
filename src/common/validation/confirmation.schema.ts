import { z } from 'zod';
import { otp, ln, token } from './fields.js';

export const confirmationSchema = z.object({
  body: z.object({ otp, token }),

  query: z.object({ ln }),

  params: z.object({}),
});
