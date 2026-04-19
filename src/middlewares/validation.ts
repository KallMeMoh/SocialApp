import type { NextFunction, Response, Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ZodType } from 'zod';

type RequestSchema<BodyT, ParamsT, QueryT> = {
  body: BodyT;
  params: ParamsT;
  query: QueryT;
};

export const validate =
  <BodyT, ParamsT extends ParamsDictionary, QueryT>(
    schema: ZodType<RequestSchema<BodyT, ParamsT, QueryT>>,
  ) =>
  async (req: Request, _: Response, next: NextFunction) => {
    const { body, params } = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = body;
    req.params = params;

    next();
  };
