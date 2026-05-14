import { Router } from 'express';

export const commentRouter = Router();

commentRouter.post('/'); // create comment on post/comment

commentRouter.get('/:commentId/replies');

commentRouter.patch('/:commentId');

commentRouter.delete('/:commentId');
