import chatRepository from './conversation.repository.js';

class ChatService {
  constructor(private readonly _chatRepository: typeof chatRepository) {}
  async sendMessage(userId: string, conversationId: string, text: string) {
    const allowed = await this._chatRepository.isParticipant(
      conversationId,
      userId,
    );
    if (!allowed) throw new Error('Not a participant of this conversation');

    return this._chatRepository.createMessage(conversationId, userId, text);
  }

  getUserRoomIds(userId: string) {
    return this._chatRepository.getUserConversationIds(userId);
  }
}

export default new ChatService(chatRepository);
