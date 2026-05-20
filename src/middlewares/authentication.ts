import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

import { HttpError } from '../common/errors/http-error.js';
import { isTokenTypeEnum, TokenTypeEnum } from '../common/types/auth.type.js';
import { getSignature } from '../common/utils/auth/token-signature.js';
import { RedisClient } from '../database/redis.connection.js';
import { isUserRoleEnum } from '../common/types/user.type.js';
import { Types } from 'mongoose';

export const authenticate =
  (requiredTokenType = TokenTypeEnum.Access) =>
  async (req: Request, _: Response, next: NextFunction) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader) throw new HttpError(401, `Missing authorization header`);

    if (!authHeader.startsWith('Bearer '))
      throw new HttpError(401, 'Invalid bearer key');

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) throw new HttpError(401, 'Missing Token');

    try {
      const decoded = jwt.decode(token);
      const { aud } = (
        typeof decoded === 'object' && decoded !== null ? decoded : {}
      ) as JwtPayload;
      const [role, tokenType] = (Array.isArray(aud) ? aud : []) as [
        string?,
        string?,
      ];

      if (
        !role ||
        !tokenType ||
        !isUserRoleEnum(role) ||
        !isTokenTypeEnum(tokenType) ||
        tokenType !== requiredTokenType
      ) {
        throw new HttpError(401, 'Invalid or malformed token');
      }

      const signature = getSignature(role)[`${tokenType}Signature`];
      if (!signature) throw new HttpError(401, 'Invalid or malformed token');

      const { sub, jti } = jwt.verify(token, signature) as JwtPayload;

      if (
        !jti ||
        !Types.ObjectId.isValid(sub ?? '') ||
        (await RedisClient.get(`jwt:blacklist:${jti}`))
      )
        throw new HttpError(401, 'Invalid or malformed token');

      req.userId = new Types.ObjectId(sub);
      req.tokenId = jti;
      req.userRole = role;
      next();
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(401, 'Invalid or malformed token');
    }
  };
