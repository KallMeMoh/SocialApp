import type { AuthProviderEnum } from './auth.type.js';

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  avatar?: string;
  verified?: boolean;
  has2FA?: boolean;
  hashed_password?: string;
  // system
  provider: AuthProviderEnum;
  role?: UserRoleEnum;
  verificationExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

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
