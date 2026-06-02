import { Router } from 'express';
import {
  getConversationByThreadId,
  getMessagesByThreadId,
  publishMessage,
} from '../mocks/messageStore.js';

export const threadsRouter = Router();

threadsRouter.get('/:threadId/conversation', (req, res) => {
  const { threadId } = req.params;
  res.json(getConversationByThreadId(threadId));
});

threadsRouter.get('/:threadId/messages', (req, res) => {
  const { threadId } = req.params;
  res.json(getMessagesByThreadId(threadId));
});

threadsRouter.patch('/:threadId/read', (req, res) => {
  res.json({ ok: true });
});

threadsRouter.post('/:threadId/messages/text', (req, res) => {
  const { threadId } = req.params;
  const { message } = req.body ?? {};

  if (!message?.trim()) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const result = publishMessage({
    threadId,
    direction: 'outbound',
    body: message.trim(),
  });

  res.json({
    ok: true,
    sid: result.message.sid,
    subscribersNotified: result.subscribersNotified,
    omnitalkSubscribersNotified: result.omnitalkSubscribersNotified ?? 0,
  });
});
