import type { AuthProvider } from './auth.types.js';

export interface User {
  _id?: string;
  username: string;
  email: string;
  avatar?: string;
  verified?: boolean;
  has2FA?: boolean;
  hashed_password?: string;
  // system
  provider: AuthProvider;
  role?: UserRole;
  verificationExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  User,
  Admin,
}
