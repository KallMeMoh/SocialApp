import { Router } from 'express';
import PostService from './post.service.js';
import { validate } from '../../middlewares/validation.js';
import {
  createPostSchema,
  postIdSchema,
  updatePostSchema,
} from './post.dto.js';

export const postRouter = Router();

postRouter.get('/', async (_req, res) => {
  const posts = await PostService.getAllPosts();
  return res.status(200).json(posts);
});

postRouter.get('/:postId', validate(postIdSchema), async (req, res) => {
  const post = await PostService.getPost(req.params);
  return res.status(200).json(post);
});

postRouter.post(
  '/:postId/publish',
  validate(postIdSchema),
  async (req, res) => {
    const post = await PostService.confirmPostCreation(req.userId!, req.params);
    return res.status(200).json(post);
  },
);

postRouter.get(
  '/:postId/comments',
  validate(postIdSchema),
  async (req, res) => {
    const comments = await PostService.getPostComments(req.params);
    return res.status(200).json(comments);
  },
);

postRouter.post('/', validate(createPostSchema), async (req, res) => {
  const post = await PostService.createPost(req.userId!, req.body);
  return res.status(201).json(post);
});

postRouter.patch('/:postId', validate(updatePostSchema), async (req, res) => {
  const post = await PostService.updatePost(req.userId!, req.body, req.params);
  return res.status(200).json(post);
});

postRouter.delete('/:postId', validate(postIdSchema), async (req, res) => {
  await PostService.deletePost(req.userId!, req.params);
  return res.status(200).json({ message: 'Post deleted successfully' });
});
