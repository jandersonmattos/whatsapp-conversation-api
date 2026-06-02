import { Router } from 'express';
import {
  getSimulatorDefaults,
  publishMessage,
} from '../mocks/messageStore.js';
import { getConnectedClientCount, getSubscriptionCount } from '../websocket/pusherSimulator.js';

export const simulatorRouter = Router();

simulatorRouter.get('/config', (_req, res) => {
  const defaults = getSimulatorDefaults();
  res.json({
    ...defaults,
    connectedClients: getConnectedClientCount(),
    channelSubscribers: getSubscriptionCount(defaults.channel),
    omnitalkChannelSubscribers: getSubscriptionCount(defaults.omnitalkChannel),
  });
});

simulatorRouter.post('/publish', (req, res) => {
  const { threadId, direction, body } = req.body ?? {};

  if (!threadId || !direction || !body?.trim()) {
    res.status(400).json({
      error: 'threadId, direction and body are required',
    });
    return;
  }

  if (direction !== 'inbound' && direction !== 'outbound') {
    res.status(400).json({ error: 'direction must be inbound or outbound' });
    return;
  }

  const result = publishMessage({
    threadId,
    direction,
    body: body.trim(),
  });

  res.json({
    ok: true,
    ...result,
    connectedClients: getConnectedClientCount(),
    channelSubscribers: getSubscriptionCount(result.channel),
    omnitalkChannelSubscribers: result.omnitalkChannel
      ? getSubscriptionCount(result.omnitalkChannel)
      : 0,
  });
});
