import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { config } from './config.js';
import { RoomManager } from './game/RoomManager.js';
import { GameManager } from './game/GameManager.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

const app = express();

// Allowed CORS origins: Handles Vercel production frontend and local development
const allowedOrigins =
  config.CLIENT_URL === '*'
    ? '*'
    : [
        config.CLIENT_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://localhost:4173',
      ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Health Check Endpoint (Required for Render & monitoring)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    game: 'Neon Coin Clash',
    timestamp: Date.now(),
    environment: config.NODE_ENV,
  });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ['websocket', 'polling'],
});

const roomManager = new RoomManager();
const gameManager = new GameManager(roomManager, io);

setupSocketHandlers(io, roomManager, gameManager);

httpServer.listen(config.PORT, '0.0.0.0', () => {
  console.log(`[Neon Coin Clash] Server running on port ${config.PORT} (0.0.0.0)`);
  console.log(`[Neon Coin Clash] Health check: http://localhost:${config.PORT}/health`);
  console.log(`[Neon Coin Clash] Allowed CORS Origin:`, allowedOrigins);
});

// Graceful shutdown
const shutdown = () => {
  console.log('[Neon Coin Clash] Server shutting down...');
  io.close(() => {
    httpServer.close(() => {
      console.log('[Neon Coin Clash] Server stopped.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
