import { z } from 'zod';

export const username = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'Missing username field' : undefined,
  })
  .trim()
  .min(3, { error: 'Username must be at least 3 characters' })
  .max(20, { error: 'Username must be at most 20 characters' })
  .regex(/^[A-Z]/, { error: 'Username must start with an uppercase letter' })
  .regex(/^[a-zA-Z0-9_]+$/, {
    error: 'Username can only include _ special character',
  });

export const email = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'Missing email field' : undefined,
  })
  .trim()
  .max(254, { error: 'Invalid email address' })
  .toLowerCase()
  .pipe(z.email({ error: 'Invalid email address' }));

export const password = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'Missing password fields' : undefined,
  })
  .min(8, { error: 'Passwords must be at least 8 characters' })
  .max(72, { error: 'Passwords must be at most 72 characters' })
  .regex(/[A-Z]/, {
    error: 'Passwords must contain at least one uppercase character',
  })
  .regex(/[a-z]/, {
    error: 'Passwords must contain at least one lowercase character',
  })
  .regex(/[0-9]/, {
    error: 'Passwords must contain at least one number character',
  })
  .regex(/[^a-zA-Z0-9]/, {
    error: 'Passwords must contain at least one special character',
  });

export const id = z
  .string({
    error: (issue) => (issue.input === undefined ? 'Missing ID' : undefined),
  })
  .regex(/^[a-fA-F0-9]{24}$/, { error: 'Invalid ID' });

export const otp = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'Missing OTP code' : undefined,
  })
  .length(6, { error: 'OTP must be 6 digits' })
  .regex(/^[0-9]+$/, { error: 'OTP must be numeric' });

export const token = z
  .string({
    error: (issue) => (issue.input === undefined ? 'Missing token' : undefined),
  })
  .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, {
    error: 'Malformed token',
  });

export const ln = z
  .string()
  .trim()
  .refine((v) => v === 'en', { error: 'Language not supported' })
  .optional();
