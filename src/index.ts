import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { threadsRouter } from './routes/threads.js';
import { simulatorRouter } from './routes/simulator.js';
import { setupWebSocketServer } from './websocket/pusherSimulator.js';

const PORT = Number(process.env.PORT ?? 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/threads', threadsRouter);
app.use('/api/simulator', simulatorRouter);

app.get('/simulator', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/simulator.html'));
});

const server = createServer(app);
setupWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`WhatsApp conversation API running at http://localhost:${PORT}`);
  console.log(`  GET  /api/threads/:threadId/conversation`);
  console.log(`  GET  /api/threads/:threadId/messages`);
  console.log(`  GET  /simulator  (Pusher message publisher UI)`);
  console.log(`  POST /api/simulator/publish`);
  console.log(`  WS   ws://localhost:${PORT}/ws`);
});
