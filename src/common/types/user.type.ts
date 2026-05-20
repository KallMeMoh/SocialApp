import type { AuthProviderEnum } from './auth.type.js';

interface IUserBase {
  username: string;
  email: string;
  avatar: string | null;
  verified: boolean;
  has2FA: boolean;
  role: UserRoleEnum;
  verificationExpiry: Date | null;
  deletedAt: Date | null;
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
