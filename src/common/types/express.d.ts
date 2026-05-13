import type { UserRoleEnum } from './user.type.ts';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tokenId?: string;
      userRole?: UserRoleEnum;
    }
  }
}

export {};
