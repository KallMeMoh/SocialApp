import { Router } from 'express';
import storyService from './story.service.js';
import {
  createStorySchema,
  deleteStorySchema,
  followedUsersStoriesSchema,
} from './story.dto.js';
import { validate } from '../../middlewares/validation.js';
import r2bucketService from '../../common/services/r2bucket.service.js';

export const storyRouter = Router();

storyRouter.get('/me', async (req, res) => {
  const stories = await storyService.getAuthorStories(req.userId!);
  return res.status(200).json(stories);
});

storyRouter.get(
  '/followed',
  validate(followedUsersStoriesSchema),
  async (req, res) => {
    const stories = await storyService.getFollowedUsersStories(
      req.userId!,
      req.query,
    );
    return res.status(200).json(stories);
  },
);

storyRouter.post('/', validate(createStorySchema), async (req, res) => {
  const { story, key } = await storyService.createStory(req.userId!, req.body);

  let mediaUploadUrl;
  if (req.body.mimeType && key)
    mediaUploadUrl = await r2bucketService.generateUploadUrl(
      key,
      req.body.mimeType,
    );

  return res
    .status(201)
    .json({ message: 'Story created successfully', story, mediaUploadUrl });
});

storyRouter.delete(
  '/:storyId',
  validate(deleteStorySchema),
  async (req, res) => {
    await storyService.deleteStory(req.userId!, req.params);
    return res.status(200).json({ message: 'Story deleted successfully' });
  },
);
