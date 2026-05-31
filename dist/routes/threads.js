import { Router } from 'express';
import { getConversationByThreadId, getMessagesByThreadId, } from '../mocks/messageStore.js';
export const threadsRouter = Router();
threadsRouter.get('/:threadId/conversation', (req, res) => {
    const { threadId } = req.params;
    res.json(getConversationByThreadId(threadId));
});
threadsRouter.get('/:threadId/messages', (req, res) => {
    const { threadId } = req.params;
    res.json(getMessagesByThreadId(threadId));
});
