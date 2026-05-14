import type { Types } from 'mongoose';
import type { AuthProviderEnum } from './auth.type.js';

interface IUserBase {
  _id: Types.ObjectId;
  username: string;
  email: string;
  avatar: string | null;
  verified: boolean;
  has2FA: boolean;
  role: UserRoleEnum;
  verificationExpiry: Date | null;
  isDeleted: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IUser =
  | (IUserBase & {
      provider: AuthProviderEnum.System;
      password: string;
    })
  | (IUserBase & {
      provider: AuthProviderEnum.Google;
    });

export enum UserRoleEnum {
  User = 'user',
  Admin = 'admin',
}

export function isUserRoleEnum(value: any): value is UserRoleEnum {
  return (
    Object.values(UserRoleEnum).findIndex((userRole) => userRole === value) !==
    -1
  );
}
