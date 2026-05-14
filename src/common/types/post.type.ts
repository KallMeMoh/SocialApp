import type { Types } from 'mongoose';
import type { ReactionEnum } from './reaction.type.js';

export type MediaType = 'image' | 'video' | 'gif';

export interface Media {
  url: string;
  type: MediaType;
}

export interface IPost {
  authorId: Types.ObjectId;
  content: {
    text: String;
    media: Media[];
  };
  quotedPostId: Types.ObjectId | null;
  stats: {
    reactionCounts: Record<ReactionEnum, number>;
    commentCount: number;
    quoteCount: number;
  };
  hashtags: String[];
  mentions: String[];
  isDeleted?: Date;
}
