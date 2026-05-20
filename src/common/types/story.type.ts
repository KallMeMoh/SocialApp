import type { Types } from 'mongoose';

export enum StoryTypeEnum {
  Image = 'image',
  Video = 'video',
  Text = 'text',
}

export interface IStory {
  author: Types.ObjectId;
  type: StoryTypeEnum;
  url: string | null;
  text: string | null;
  expiresAt: Date;
  deletedAt: Date | null;
}
