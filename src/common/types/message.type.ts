import type { Types } from 'mongoose';

export interface IMessage {
  text: string;

  // attachments
  // reactions

  senderId: Types.ObjectId;
  conversationId: Types.ObjectId;

  deletedAt: Date | null;
}
