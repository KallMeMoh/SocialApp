import express from 'express';
import authRouter from './modules/auth/auth.controller.js';
import { errorHandler } from './middlewares/error-handler.js';
import { PORT } from './config/index.js';
import { HttpError } from './common/errors/http-error.js';
import { connectMongo } from './database/mongo.connection.js';
import { connectRedis } from './database/redis.connection.js';

export async function bootstrap() {
  const app = express();

  await Promise.all([connectMongo(), connectRedis()]);

  app.use(express.json());

  app.use('/auth', authRouter);

  app.all('{/*endpoints}', (_, __) => {
    throw new HttpError(404, 'Endpoint not found');
  });

  app.use(errorHandler);

  app.listen(PORT, () =>
    console.log(`Server is up and running on port ${PORT}`),
  );
}
