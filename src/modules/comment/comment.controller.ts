import { Router } from 'express';
import { validate } from '../../middlewares/validation.js';
import {
  commentIdSchema,
  createCommentSchema,
  patchCommentSchema,
} from './comment.dto.js';
import CommentService from './comment.service.js';

export const commentRouter = Router();

// note to self: create comment on post/comment
commentRouter.post('/', validate(createCommentSchema), async (req, res) => {
  const comment = await CommentService.createComment(req.userId!, req.body);
  return res.status(200).json(comment);
});

commentRouter.get(
  '/:commentId/replies',
  validate(commentIdSchema),
  async (req, res) => {
    const replies = await CommentService.getCommentReplies(req.params);
    return res.status(200).json(replies);
  },
);

commentRouter.patch(
  '/:commentId',
  validate(patchCommentSchema),
  async (req, res) => {
    const post = CommentService.editComment(req.userId!, req.params, req.body);
    return res.status(200).json(post);
  },
);

commentRouter.delete(
  '/:commentId',
  validate(commentIdSchema),
  async (req, res) => {
    await CommentService.deleteComment(req.userId!, req.params);
    return res.status(200).json({ message: 'Comment deleted successfully' });
  },
);
