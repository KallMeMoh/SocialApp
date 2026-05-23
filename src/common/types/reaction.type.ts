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
  author: Types.ObjectId;
  emoji: ReactionEnum;

  // note to self: either will be set but not both
  post: Types.ObjectId | null;
  comment: Types.ObjectId | null;

  deletedAt: Date | null;
}
