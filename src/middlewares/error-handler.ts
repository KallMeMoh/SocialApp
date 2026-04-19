import * as z from 'zod';
import { HttpError } from '../common/errors/http-error.js';
import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: unknown,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  } else if (err instanceof z.ZodError) {
    return res.status(422).json({
      error: 'Validation failed',
      // details: err.
    });
    // } else if (err instanceof MulterError) {
    // return res.status(422).json({ error: err.message });
    // } else if (err instanceof jwt.TokenExpiredError) {
    // return res.status(401).json({ error: 'Token expired' });
    // } else if (err instanceof jwt.JsonWebTokenError) {
    // return res.status(401).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
