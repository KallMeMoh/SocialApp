import { model, Schema } from 'mongoose';
import { UserRoleEnum, type IUser } from '../../common/types/user.type.js';
import { AuthProviderEnum } from '../../common/types/auth.type.js';

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    has2FA: {
      type: Boolean,
      default: false,
    },
    hashed_password: {
      type: String,
      required: function (): boolean {
        return this.provider === AuthProviderEnum.System;
      },
    },
    // system
    provider: {
      type: String,
      enum: Object.values(AuthProviderEnum),
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRoleEnum),
      default: UserRoleEnum.User,
    },
    verificationExpiry: {
      type: Date,
      default: () => new Date(),
      index: { expireAfterSeconds: 86400 },
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model('User', userSchema);
