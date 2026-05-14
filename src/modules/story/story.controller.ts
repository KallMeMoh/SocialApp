import { Router } from 'express';

export const storyRouter = Router();

storyRouter.get('/');

storyRouter.get('/:storyId');

storyRouter.post('/');

storyRouter.delete('/:storyId');
