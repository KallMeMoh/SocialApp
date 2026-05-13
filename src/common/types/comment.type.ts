import type { Types } from 'mongoose';
import type { ReactionEnum } from './reaction.type.js';

export interface IComment {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  text: string;

  postId: Types.ObjectId | null;
  parentId: Types.ObjectId | null;

  rootPostId: Types.ObjectId | null;

  stats: {
    reactionCounts: Record<ReactionEnum, number>;
    replyCount: number;
  };
  isDeleted?: Date;
  createdAt: Date;
  updatedAt: Date;
}
