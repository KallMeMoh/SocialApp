import { model, Schema } from 'mongoose';
import type { IMessage } from '../../common/types/message.type.js';

const messageSchema = new Schema<IMessage>(
  {
    text: {
      type: String,
      minLength: [1, 'Too short'],
      maxLength: [2000, 'Too long'],
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const MessageModel = model('Message', messageSchema);
