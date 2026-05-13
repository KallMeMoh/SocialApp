import type { Types } from 'mongoose';

export enum ReactionEnum {
  Like = '👍',
  Love = '❤️',
  Joy = '😂',
  Surprise = '😮',
  Sad = '😢',
  Anger = '😡',
}

export interface IReaction {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  emoji: ReactionEnum;

  // note to self: either will be set but not both
  postId: Types.ObjectId | null;
  commentId: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}
