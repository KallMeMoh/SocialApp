import type { Types } from 'mongoose';
import type { Media } from './post.type.js';

export interface IStory {
  author: Types.ObjectId;
  media: Media | null;
  text: string;
  expiresAt: Date;
  deletedAt: Date | null;
}
