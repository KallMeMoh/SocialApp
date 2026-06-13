import { model, Schema } from 'mongoose';
import type { IConversation } from '../../common/types/conversation.type.js';

const conversationSchema = new Schema<IConversation>(
  {
    name: {
      type: String,
      default: null,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    members: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ConversationModel = model('Conversation', conversationSchema);
