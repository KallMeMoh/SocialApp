import express from 'express';
import authRouter from './modules/auth/auth.controller.js';
import { errorHandler } from './middlewares/error-handler.js';
import { PORT } from './config/index.js';
import { HttpError } from './common/errors/http-error.js';
import { connectMongo } from './database/mongo.connection.js';
import { connectRedis } from './database/redis.connection.js';
import { userRouter } from './modules/user/user.controller.js';
import { postRouter } from './modules/post/post.controller.js';
import { commentRouter } from './modules/comment/comment.controller.js';
import { storyRouter } from './modules/story/story.controller.js';
import { reactionRouter } from './modules/reaction/reaction.controller.js';
import { authenticate } from './middlewares/authentication.js';

export async function bootstrap() {
  const app = express();

  await Promise.all([connectMongo(), connectRedis()]);

  app.use(express.json());

  app.use('/auth', authRouter);
  app.use('/users', authenticate(), userRouter);
  app.use('/posts', authenticate(), postRouter);
  app.use('/comments', authenticate(), commentRouter);
  app.use('/stories', authenticate(), storyRouter);
  app.use('/reactions', authenticate(), reactionRouter);

  app.all('{/*endpoints}', (_, __) => {
    throw new HttpError(404, 'Endpoint not found');
  });

  app.use(errorHandler);

  app.listen(PORT, () =>
    console.log(`Server is up and running on port ${PORT}`),
  );
}
