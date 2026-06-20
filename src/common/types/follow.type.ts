import type { Types } from 'mongoose';

export interface IFollow {
  follower: Types.ObjectId;
  followee: Types.ObjectId;
  deletedAt: Date | null;
}
