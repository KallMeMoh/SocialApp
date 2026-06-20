import z from 'zod';
import { sharedFields, commentFields } from '../../common/validation/fields.js';

export const createCommentSchema = z.object({
  body: z.object({
    text: commentFields.commentText,
    postId: sharedFields.id,
    commentId: sharedFields.id.optional(),
  }),

  query: z.object({ ln: sharedFields.ln }),

  params: z.object({}),
});

export const commentIdSchema = z.object({
  body: z.object({}),

  query: z.object({ ln: sharedFields.ln }),

  params: z.object({ commentId: sharedFields.id }),
});

export const patchCommentSchema = z.object({
  body: z.object({
    text: commentFields.commentText,
  }),

  query: z.object({ ln: sharedFields.ln }),

  params: z.object({ commentId: sharedFields.id }),
});

export type CreateCommentDTO = z.infer<typeof createCommentSchema>;
export type CommentIdDTO = z.infer<typeof commentIdSchema>;
export type PatchCommentDTO = z.infer<typeof patchCommentSchema>;
