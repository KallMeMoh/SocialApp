import type { Types } from 'mongoose';
import type { ReactionEnum } from './reaction.type.js';

export enum MediaTypeEnum {
  Png = 'image/png',
  Jpeg = 'image/jpeg',
  Jpg = 'image/jpg',
  Gif = 'image/gif',
  Mp4 = 'video/mp4',
}

export interface Media {
  key: string;
  mimeType: MediaTypeEnum;
}

export enum PostStatusEnum {
  Draft = 'draft',
  Published = 'published',
  Failed = 'failed',
}

export interface IPost {
  author: Types.ObjectId;
  content: {
    text: string;
    media: Media[];
  };
  quotedPost: Types.ObjectId | null;
  stats: {
    reactionCounts: Record<ReactionEnum, number>;
    commentCount: number;
    quoteCount: number;
  };
  hashtags: string[];
  mentions: Types.ObjectId[];
  status: PostStatusEnum;
  deletedAt: Date | null;
}
