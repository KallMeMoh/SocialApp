import { model, Schema } from 'mongoose';
import { UserRole, type User } from '../../common/types/user.type.js';
import { AuthProvider } from '../../common/types/auth.types.js';

const userSchema = new Schema<User>(
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
        return this.provider === AuthProvider.System;
      },
    },
    // system
    provider: {
      type: Number,
      enum: Object.keys(AuthProvider),
      required: true,
    },
    role: {
      type: Number,
      enum: Object.keys(UserRole),
      default: UserRole.User,
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
