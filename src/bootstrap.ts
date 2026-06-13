import cors from 'cors';
import express from 'express';
import authRouter from './modules/auth/auth.controller.js';
import { errorHandler } from './middlewares/error-handler.js';
import { FRONTEND_URL, PORT } from './config/index.js';
import { HttpError } from './common/errors/http-error.js';
import { connectMongo } from './database/mongo.connection.js';
import { connectRedis } from './database/redis.connection.js';
import { userRouter } from './modules/user/user.controller.js';
import { postRouter } from './modules/post/post.controller.js';
import { commentRouter } from './modules/comment/comment.controller.js';
import { storyRouter } from './modules/story/story.controller.js';
import { reactionRouter } from './modules/reaction/reaction.controller.js';
import { authenticate } from './middlewares/authentication.js';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import { userFields, userMutations } from './modules/user/user.graphql.js';
import userService from './modules/user/user.service.js';
import socketGateway from './common/socket/socket.gateway.js';

export async function bootstrap() {
  const app = express();

  await Promise.all([connectMongo(), connectRedis()]);

  app.use(express.json());
  app.use(cors({ origin: FRONTEND_URL }));

  const graphQlSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        ...userFields,
      },
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: {
        ...userMutations,
      },
    }),
  });

  app.all(
    '/graphql',
    createHandler({
      schema: graphQlSchema,
      context: (req) => ({
        req,
        userService,
      }),
    }),
  );

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

  const server = app.listen(PORT, () =>
    console.log(`Server is up and running on port ${PORT}`),
  );

  socketGateway.createSocketServer(server);
}
