import { Router } from 'express';

export const postRouter = Router();

postRouter.get('/');

postRouter.get('/:postId');

postRouter.get('/:postId/comments');

postRouter.post('/');

postRouter.patch('/:postId');

postRouter.delete('/:postId');
