import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { config } from './config.js';
import { RoomManager } from './game/RoomManager.js';
import { GameManager } from './game/GameManager.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

const app = express();

// Robust CORS validation supporting Vercel production, preview branches, and local development
const corsOriginValidator = (
  origin: string | undefined,
  callback: (err: Error | null, origin?: boolean | string) => void
) => {
  // Allow requests with no origin (such as mobile apps, curl, server-to-server)
  if (!origin) {
    return callback(null, true);
  }

  const configuredClient = (process.env.CLIENT_URL || config.CLIENT_URL || '').trim().replace(/\/$/, '');
  const normalizedOrigin = origin.trim().replace(/\/$/, '');

  // 1. Allow wildcard or configured CLIENT_URL
  if (!configuredClient || configuredClient === '*' || normalizedOrigin === configuredClient) {
    return callback(null, origin);
  }

  // 2. Allow any Vercel deployment (*.vercel.app)
  if (normalizedOrigin.endsWith('.vercel.app')) {
    return callback(null, origin);
  }

  // 3. Allow localhost / 127.0.0.1 for development
  if (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')) {
    return callback(null, origin);
  }

  // Permissive fallback so production multiplayer is never blocked by a CORS mismatch
  return callback(null, origin);
};

const corsOptions = {
  origin: corsOriginValidator,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json());

// Root endpoint for quick uptime/ping check
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    game: 'Neon Coin Clash',
    message: 'Server is running',
    timestamp: Date.now(),
  });
});

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
    origin: corsOriginValidator,
    methods: ['GET', 'POST'],
    credentials: false,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ['polling', 'websocket'],
  allowEIO3: true,
});

const roomManager = new RoomManager();
const gameManager = new GameManager(roomManager, io);

// Connection logging for Render production monitoring
io.on('connection', (socket) => {
  console.log('[Neon Coin Clash] Socket connected:', socket.id, 'from origin:', socket.handshake.headers.origin || 'unknown');
  socket.on('disconnect', (reason) => {
    console.log('[Neon Coin Clash] Socket disconnected:', socket.id, 'reason:', reason);
  });
});

setupSocketHandlers(io, roomManager, gameManager);

httpServer.listen(config.PORT, '0.0.0.0', () => {
  console.log('Server listening on:', config.PORT);
  console.log('Allowed frontend:', process.env.CLIENT_URL || '*');
  console.log(`[Neon Coin Clash] Health check: http://0.0.0.0:${config.PORT}/health`);
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
