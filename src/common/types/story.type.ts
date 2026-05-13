import type { Types } from 'mongoose';

export enum StoryTypeEnum {
  Image = 'image',
  Video = 'video',
  Text = 'text',
}

export interface IStory {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  type: StoryTypeEnum;
  url?: string;
  text?: string;
  expiresAt: Date;
  stats: {
    viewCount: number;
  };
  isDeleted?: Date;
  createdAt: Date;
  updatedAt: Date;
}
