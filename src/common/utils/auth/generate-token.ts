import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getSignature } from './token-signature.js';
import { TokenTypeEnum } from '../../types/auth.type.js';
import type { UserRoleEnum } from '../../types/user.type.js';
import type { Types } from 'mongoose';

export const generateTokens = (
  userId: Types.ObjectId,
  userRole: UserRoleEnum,
  jti?: string,
) => {
  const jwtid = jti ?? randomUUID();
  const { accessSignature, refreshSignature } = getSignature(userRole);

  const accessToken = jwt.sign({ sub: userId }, accessSignature, {
    audience: [`${userRole}`, `${TokenTypeEnum.Access}`], // peak self reflection: the role is compared in authorization middleware. it's value is dependant on a DB lookup in token rotation endpoint
    expiresIn: '15m',
    jwtid,
  });

  // shouldn't refresh token be an httpOnly
  // cookie and not sent in response body?
  const refreshToken = jwt.sign({ sub: userId }, refreshSignature, {
    audience: [`${userRole}`, `${TokenTypeEnum.Refresh}`], // peak self reflection: the role here is only used for sig. selection in auth middleware, IT IS NOT A SOURCE OF TRUTH
    expiresIn: '1y',
    jwtid,
  });

  return { accessToken, refreshToken, requires2FA: false } as const;
};
