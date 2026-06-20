import { model, Schema, Types } from 'mongoose';
import type { IFollow } from '../../common/types/follow.type.js';

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    followee: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },

    deletedAt: { type: Date },
  },
  { timestamps: true },
);

followSchema.index({ follower: 1, followee: 1 }, { unique: true });
followSchema.index({ followee: 1, deletedAt: 1 });
followSchema.index({ follower: 1, deletedAt: 1 });

export const FollowModel = model('Follow', followSchema);
