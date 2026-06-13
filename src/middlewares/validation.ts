import type { NextFunction, RequestHandler } from 'express';
import { z } from 'zod';

type AnyRouteSchema = z.ZodObject<{
  body: z.ZodType;
  query: z.ZodType;
  params: z.ZodType;
}>;

type HandlerFor<T extends AnyRouteSchema> = RequestHandler<
  z.infer<T>['params'],
  unknown,
  z.infer<T>['body'],
  z.infer<T>['query']
>;

export function validate<T extends AnyRouteSchema>(schema: T): HandlerFor<T> {
  return async function (req, _res, next: NextFunction) {
    const { success, data, error } = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (success) {
      req.body = data.body;
      req.params = data.params;
      next();
    } else {
      next(error);
    }
  };
}

export function validatedWS<T>(
  schema: z.ZodType<T>,
  handler: (data: T, ack: (res: string) => void) => void,
) {
  return async (packet: unknown, ack: (res: string) => void) => {
    const { success, data, error } = await schema.safeParseAsync(packet);

    if (success) {
      handler(data, ack);
    } else {
      ack(error.message);
    }
  };
}
