import type { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { PusherBroadcastEnvelope, WsClientMessage } from '../types/pusher.js';

interface ClientState {
  channels: Set<string>;
}

const clients = new Map<WebSocket, ClientState>();

export function setupWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket) => {
    clients.set(socket, { channels: new Set() });

    socket.send(
      JSON.stringify({
        event: 'pusher:connection_established',
        data: { message: 'Pusher simulator connected' },
      }),
    );

    socket.on('message', (raw) => {
      try {
        const message = JSON.parse(String(raw)) as WsClientMessage;
        handleClientMessage(socket, message);
      } catch {
        socket.send(
          JSON.stringify({
            event: 'pusher:error',
            data: { message: 'Invalid JSON' },
          }),
        );
      }
    });

    socket.on('close', () => {
      clients.delete(socket);
    });
  });

  console.log('  WebSocket (Pusher simulator) ws://localhost:<port>/ws');

  return wss;
}

function handleClientMessage(socket: WebSocket, message: WsClientMessage) {
  const state = clients.get(socket);
  if (!state) return;

  if (message.action === 'ping') {
    socket.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
    return;
  }

  if (!message.channel) {
    socket.send(
      JSON.stringify({
        event: 'pusher:error',
        data: { message: 'channel is required' },
      }),
    );
    return;
  }

  if (message.action === 'subscribe') {
    state.channels.add(message.channel);
    socket.send(
      JSON.stringify({
        event: 'pusher:subscription_succeeded',
        channel: message.channel,
        data: {},
      }),
    );
    return;
  }

  if (message.action === 'unsubscribe') {
    state.channels.delete(message.channel);
    socket.send(
      JSON.stringify({
        event: 'pusher:unsubscription_succeeded',
        channel: message.channel,
        data: {},
      }),
    );
  }
}

export function broadcastToChannel(envelope: PusherBroadcastEnvelope): number {
  let delivered = 0;
  const payload = JSON.stringify(envelope);

  for (const [socket, state] of clients.entries()) {
    if (socket.readyState !== WebSocket.OPEN) continue;
    if (!state.channels.has(envelope.channel)) continue;
    socket.send(payload);
    delivered += 1;
  }

  return delivered;
}

export function getConnectedClientCount(): number {
  return clients.size;
}

export function getSubscriptionCount(channel: string): number {
  let count = 0;
  for (const [, state] of clients.entries()) {
    if (state.channels.has(channel)) count += 1;
  }
  return count;
}
