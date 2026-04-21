import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

import { HttpError } from '../common/errors/http-error.js';
import type { UserRole } from '../common/types/user.type.js';
import { TokenType } from '../common/types/auth.types.js';
import { getSignature } from '../common/utils/auth/token-signature.js';
import { RedisClient } from '../database/redis.connection.js';

export const authenticate =
  (tokenType = TokenType.Access) =>
  async (req: Request, _: Response, next: NextFunction) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader) throw new HttpError(401, `Missing authorization header`);

    if (!authHeader.startsWith('Bearer '))
      throw new HttpError(401, 'Invalid bearer key');

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) throw new HttpError(401, 'Missing Token');

    try {
      const { aud } = (jwt.decode(token) ?? {}) as JwtPayload;
      const [role, type] = (Array.isArray(aud) ? aud : []) as [
        UserRole,
        TokenType,
      ];

      if (!role || !type || type !== tokenType)
        throw new HttpError(401, 'Invalid or malformed token');

      const signature = getSignature(role)[`${tokenType}Signature`];
      if (!signature) throw new HttpError(401, 'Invalid or malformed token');

      const { sub, jti } = jwt.verify(token, signature) as JwtPayload;

      if (await RedisClient.get(`jwt:blacklist:${jti}`))
        throw new HttpError(401, 'Invalid or malformed token');

      req.userId = sub;
      req.tokenId = jti;
      req.userRole = role;
      next();
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(401, 'Invalid or malformed token');
    }
  };
