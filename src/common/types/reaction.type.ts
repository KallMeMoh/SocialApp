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
  userId: Types.ObjectId;
  emoji: ReactionEnum;

  // note to self: either will be set but not both
  postId: Types.ObjectId | null;
  commentId: Types.ObjectId | null;

  isDeleted?: Date;
}
