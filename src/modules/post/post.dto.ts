import { z } from 'zod';
import { sharedFields, postFields } from '../../common/validation/fields.js';

export const createPostSchema = z.object({
  body: z.object({
    text: postFields.postText,
    mentions: postFields.postMentions,
    hashtags: postFields.postHashtags,
    media: postFields.postMedia,
    quotedPost: sharedFields.id.optional(),
  }),

  query: z.object({ ln: sharedFields.ln }),

  params: z.object({}),
});

export const postIdSchema = z.object({
  body: z.object({}),

  query: z.object({ ln: sharedFields.ln }),

  params: z.object({ postId: sharedFields.id }),
});

export const updatePostSchema = z.object({
  body: z.object({
    text: z
      .string()
      .trim()
      .max(1000, { error: 'Text must be at most 1000 characters' }),
  }),

  query: z.object({ ln: sharedFields.ln }),

  params: z.object({ postId: sharedFields.id }),
});

export type PostIdDTO = z.infer<typeof postIdSchema>;
export type CreatePostDTO = z.infer<typeof createPostSchema>;
export type UpdatePostDTO = z.infer<typeof updatePostSchema>;
