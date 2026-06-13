import ChatService from '../conversation.service.js';
import { ChatEvents } from './conversation.events.js';
import type {
  AppServer,
  AppSocket,
} from '../../../common/types/socket.type.js';

export const registerChatHandlers = async (
  socket: AppSocket,
  io: AppServer,
) => {
  const conversationIds = await ChatService.getUserRoomIds(
    socket.data.userId.toString(),
  );
  conversationIds.forEach((c) => socket.join(c._id.toString()));

  socket.on(ChatEvents.SEND_MESSAGE, async (payload) => {
    try {
      const message = await ChatService.sendMessage(
        socket.data.userId.toString(),
        payload.conversationId,
        payload.text,
      );
      io.to(payload.conversationId).emit(ChatEvents.NEW_MESSAGE, message);
    } catch (err) {
      socket.emit('error', { message: (err as Error).message });
    }
  });
};
