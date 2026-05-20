import { z } from 'zod';
import {
  id,
  ln,
  postHashtags,
  postMedia,
  postMentions,
  postText,
} from '../../common/validation/fields.js';

export const createPostSchema = z.object({
  body: z.object({
    text: postText,
    mentions: postMentions,
    hashtags: postHashtags,
    media: postMedia,
  }),

  query: z.object({ ln }),

  params: z.object({}),
});

export const postIdSchema = z.object({
  body: z.object({}),

  query: z.object({ ln }),

  params: z.object({ postId: id }),
});

export const updatePostSchema = z.object({
  body: z.object({
    text: z
      .string()
      .trim()
      .max(1000, { error: 'Text must be at most 1000 characters' }),
  }),

  query: z.object({ ln }),

  params: z.object({ postId: id }),
});

export type PostIdDTO = z.infer<typeof postIdSchema>;
export type CreatePostDTO = z.infer<typeof createPostSchema>;
export type UpdatePostDTO = z.infer<typeof updatePostSchema>;
