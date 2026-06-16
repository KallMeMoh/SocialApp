import { ConversationModel } from '../../database/models/conversation.model.js';
import { MessageModel } from '../../database/models/message.model.js';

export class ConversationRepository {
  createMessage(conversationId: string, senderId: string, text: string) {
    return MessageModel.create({ conversationId, senderId, text });
  }

  getUserConversationIds(userId: string) {
    return ConversationModel.find({
      participants: userId,
      deletedAt: null,
    }).select('_id');
  }

  isParticipant(conversationId: string, userId: string) {
    return ConversationModel.exists({
      _id: conversationId,
      members: userId,
      deletedAt: null,
    });
  }
}

const conversationRepository = new ConversationRepository();
export default conversationRepository;
