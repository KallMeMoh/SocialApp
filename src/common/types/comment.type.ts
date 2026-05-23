import type { Types } from 'mongoose';
import type { ReactionEnum } from './reaction.type.js';

export interface IComment {
  author: Types.ObjectId;
  text: string;

  post: Types.ObjectId;
  comment: Types.ObjectId | null;

  stats: {
    reactionCounts: Record<ReactionEnum, number>;
    replyCount: number;
  };
  deletedAt: Date | null;
}
