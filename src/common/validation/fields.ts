import { Types } from 'mongoose';
import { z } from 'zod';
import { MediaTypeEnum } from '../types/post.type.js';

export const sharedFields = {
  id: z
    .string()
    .refine(Types.ObjectId.isValid, { error: 'Invalid resource ID' })
    .transform((val) => new Types.ObjectId(val)),
  ln: z
    .string()
    .trim()
    .refine((v) => v === 'en', { error: 'Language not supported' })
    .optional(),
};

export const authFields = {
  username: z
    .string()
    .trim()
    .min(3, { error: 'Username must be at least 3 characters' })
    .max(20, { error: 'Username must be at most 20 characters' })
    .regex(/^[A-Z]/, { error: 'Username must start with an uppercase letter' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      error: 'Username can only include _ special character',
    }),

  email: z
    .string()
    .trim()
    .max(254, { error: 'Invalid email address' })
    .toLowerCase()
    .pipe(z.email({ error: 'Invalid email address' })),

  password: z
    .string()
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
    }),

  otp: z
    .string()
    .length(6, { error: 'OTP must be 6 digits' })
    .regex(/^[0-9]+$/, { error: 'OTP must be numeric' }),

  token: z.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, {
    error: 'Malformed token',
  }),
};

export const postFields = {
  postText: z
    .string()
    .trim()
    .max(1000, { error: 'Text must be at most 1000 characters' }),

  postHashtags: z.array(z.string().toLowerCase().trim()).max(10),

  postMentions: z.array(sharedFields.id).max(20),

  postMedia: z
    .array(
      z.object({
        mimeType: z.enum(MediaTypeEnum),
      }),
    )
    .max(4),
};

export const commentFields = {
  commentText: z
    .string()
    .trim()
    .max(250, { error: 'Text must be at most 250 characters' }),
};

export const storyFields = {
  type: z.enum(MediaTypeEnum),
  text: z
    .string()
    .trim()
    .max(250, { error: 'Text must be at most 250 characters' }),
};
