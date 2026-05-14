import z from 'zod';
import { otp, ln } from './fields.js';

export const oneTimePasswordSchema = z.object({
  body: z.object({ otp }),

  query: z.object({ ln }),

  params: z.object({}),
});

export type OneTimePasswordSchema = z.infer<typeof oneTimePasswordSchema>;
