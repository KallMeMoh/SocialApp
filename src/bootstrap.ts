import express from 'express';
import authRouter from './modules/auth/auth.controller.js';
import { errorHandler } from './middlewares/error-handler.js';
import { PORT } from './config/config.js';
import { HttpError } from './errors/http-error.js';

export function bootstrap() {
  const app = express();

  app.use('/auth', authRouter);

  app.all('{/*endpoints}', (_, __) => {
    throw new HttpError(404, 'Endpoint not found');
  });

  app.use(errorHandler);

  app.listen(PORT, () =>
    console.log(`Server is up and running on port ${PORT}`),
  );
}
