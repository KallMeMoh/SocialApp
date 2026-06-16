import type { Types } from 'mongoose';
import chatRepository, {
  ConversationRepository,
} from './conversation.repository.js';

export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async getConversation(
    authorId: Types.ObjectId,
    { participantId }: GetConversationDto['params'],
  ) {
    const chat = await this.conversationRepository.getPopulatedConversation(
      {
        participant: { $all: [authorId, participantId] },
      },
      { popul },
    );
  }

  async sendMessage(userId: string, conversationId: string, text: string) {
    const allowed = await this.conversationRepository.isParticipant(
      conversationId,
      userId,
    );
    if (!allowed) throw new Error('Not a participant of this conversation');

    return this.conversationRepository.createMessage(
      conversationId,
      userId,
      text,
    );
  }

  getUserRoomIds(userId: string) {
    return this.conversationRepository.getUserConversationIds(userId);
  }
}

const conversationService = new ConversationService(chatRepository);
export default conversationService;
