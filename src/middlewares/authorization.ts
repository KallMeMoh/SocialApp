import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../common/errors/http-error.js';
import { UserRoleEnum } from '../common/types/user.type.js';

export const authorize =
  (authorizedRoles = UserRoleEnum.User) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (authorizedRoles !== req.userRole)
      throw new HttpError(403, "You don't have enough permissions");

    next();
  };
