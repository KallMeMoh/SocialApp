import { Router } from 'express';
import conversationService from './conversation.service.js';

export const chatRouter = Router({ mergeParams: true });

chatRouter.get('/', async (req, res) => {
  const conversation = await conversationService.getConversation(
    req.userId!,
    req.params,
  );
  return res.status(200).json(conversation);
});
