import { Router } from 'express';
import reactionService from './reaction.service.js';

export const reactionRouter = Router();

reactionRouter.post('/:targetId', async (req, res) => {
  const result = await reactionService.reactOnPost(
    req.userId!,
    req.params,
    req.body,
  );
  return res.status(200).json(result);
});

reactionRouter.get('/:targetId', async (req, res) => {});

reactionRouter.delete('/:targetId', async (req, res) => {});
