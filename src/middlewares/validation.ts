import type { NextFunction, RequestHandler } from 'express';
import { z } from 'zod';

type AnyRouteSchema = z.ZodObject<{
  body: z.ZodTypeAny;
  query: z.ZodTypeAny;
  params: z.ZodTypeAny;
}>;

type HandlerFor<T extends AnyRouteSchema> = RequestHandler<
  z.infer<T>['params'],
  unknown,
  z.infer<T>['body'],
  z.infer<T>['query']
>;

export function validate<T extends AnyRouteSchema>(schema: T): HandlerFor<T> {
  return async function (req, _res, next: NextFunction) {
    const { body, params } = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = body;
    req.params = params;

    next();
  };
}
