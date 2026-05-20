import type { Types } from 'mongoose';
import type { UserRoleEnum } from './user.type.ts';

declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
      tokenId?: string;
      userRole?: UserRoleEnum;
    }
  }
}

export {};
