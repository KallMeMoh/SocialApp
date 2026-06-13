import type { Types } from 'mongoose';

export interface IConversation {
  name: string | null;
  members: Types.ObjectId[];
  isGroup: boolean;
  deletedAt: Date | null;
}
