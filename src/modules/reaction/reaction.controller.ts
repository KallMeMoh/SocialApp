import { Router } from 'express';

export const reactionRouter = Router();

reactionRouter.post('/');

reactionRouter.get('/:targetId');

reactionRouter.delete('/:targetId');
