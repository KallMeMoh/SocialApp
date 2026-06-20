import { Router } from 'express';
import followService from './follow.service.js';
import { followSchema } from './follow.dto.js';
import { validate } from '../../middlewares/validation.js';

export const followRouter = Router({ mergeParams: true });

followRouter.post('/follow', validate(followSchema), async (req, res) => {
  await followService.followUser(req.userId!, req.params);
  return res.status(200).json({ message: 'Started following successfully' });
});

followRouter.delete('/follow', validate(followSchema), async (req, res) => {
  await followService.unfollowUser(req.userId!, req.params);
  return res.status(200).json({ message: 'Stopped following successfully' });
});

followRouter.get('/followers', validate(followSchema), async (req, res) => {
  const followers = await followService.getUserFollowers(req.params);
  return res.status(200).json(followers);
});

followRouter.get('/following', validate(followSchema), async (req, res) => {
  const following = await followService.getUserFollowing(req.params);
  return res.status(200).json(following);
});
