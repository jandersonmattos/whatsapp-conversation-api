# WhatsApp Conversation API (mock)

Mock backend for the WhatsApp chat frontend. Simulates REST endpoints and **Pusher real-time** notifications.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/threads/:threadId/conversation` | Conversation metadata |
| GET | `/api/threads/:threadId/messages` | Message history (Twilio format) |
| GET | `/api/simulator/config` | Simulator defaults + subscriber count |
| POST | `/api/simulator/publish` | Publish message + push via WebSocket |
| GET | `/simulator` | Web UI to publish test messages |
| WS | `/ws` | Pusher-compatible WebSocket |

## Run

```bash
npm install
npm run dev
```

## Pusher simulator

Same model as Salesforce `whatsappChat`:

- **Channel:** `whatsapp-twilio-{customerPhone}-{loftPhone}` (no `+`)
- **Inbound event:** `message-inbound-received`
- **Outbound event (simulator only):** `message-outbound-received`

### WebSocket protocol

1. Connect: `ws://localhost:3001/ws`
2. Subscribe: `{ "action": "subscribe", "channel": "whatsapp-twilio-5511999887766-551140202208" }`
3. Receive: `{ "event": "message-inbound-received", "channel": "...", "data": { "Body__c": "...", ... } }`

### Publish via UI

Open http://localhost:3001/simulator — choose inbound/outbound, type a message, publish.

The message is:
1. Appended to the in-memory store (visible on reload)
2. Pushed instantly to all WebSocket subscribers on that channel

### Publish via API

```bash
curl -X POST http://localhost:3001/api/simulator/publish \
  -H "Content-Type: application/json" \
  -d '{"threadId":"thread-demo-001","direction":"inbound","body":"Nova mensagem do cliente!"}'
```

## Test flow

1. Start API: `npm run dev`
2. Start frontend: `cd ../whtasapp-convesation && npm run dev`
3. Open chat: `http://localhost:5173/?threadId=thread-demo-001&userId=user-agent-001`
4. Open simulator: `http://localhost:3001/simulator`
5. Publish inbound message → appears instantly in chat (green dot = connected)
