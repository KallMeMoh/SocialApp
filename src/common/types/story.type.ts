import type { Types } from 'mongoose';

export enum StoryTypeEnum {
  Image = 'image',
  Video = 'video',
  Text = 'text',
}

export interface IStory {
  authorId: Types.ObjectId;
  type: StoryTypeEnum;
  url?: string;
  text?: string;
  expiresAt: Date;
  stats: {
    viewCount: number;
  };
  isDeleted?: Date;
}
