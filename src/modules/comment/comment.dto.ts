import z from 'zod';
import { commentText, id, ln } from '../../common/validation/fields.js';

export const createCommentSchema = z.object({
  body: z.object({
    text: commentText,
    postId: id,
    commentId: id.optional(),
  }),

  query: z.object({ ln }),

  params: z.object({}),
});

export const commentIdSchema = z.object({
  body: z.object({}),

  query: z.object({ ln }),

  params: z.object({ commentId: id }),
});

export const patchCommentSchema = z.object({
  body: z.object({
    text: commentText,
  }),

  query: z.object({ ln }),

  params: z.object({ commentId: id }),
});

export type CreateCommentDTO = z.infer<typeof createCommentSchema>;
export type CommentIdDTO = z.infer<typeof commentIdSchema>;
export type PatchCommentDTO = z.infer<typeof patchCommentSchema>;
