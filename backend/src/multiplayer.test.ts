import { io as Client } from 'socket.io-client';
import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import { RoomManager } from './game/RoomManager.js';
import { GameManager } from './game/GameManager.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';
import type { RoomSnapshot } from './types/game.js';

async function runTests() {
  console.log('--- Starting Neon Coin Clash Multiplayer Integration Tests ---');

  // 1. Setup local test server
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  const roomManager = new RoomManager();
  const gameManager = new GameManager(roomManager, io);
  setupSocketHandlers(io, roomManager, gameManager);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => resolve());
  });

  const address = httpServer.address();
  if (!address || typeof address === 'string') {
    throw new Error('Server address error');
  }
  const testPort = address.port;
  const serverUrl = `http://127.0.0.1:${testPort}`;
  console.log(`Test server running on port ${testPort}`);

  const createClient = () => {
    return Client(serverUrl, {
      transports: ['websocket'],
      forceNew: true,
    });
  };

  const client1 = createClient();
  const client2 = createClient();
  const client3 = createClient();

  try {
    // Wait for connection
    await Promise.all([
      new Promise<void>((res) => client1.on('connect', res)),
      new Promise<void>((res) => client2.on('connect', res)),
      new Promise<void>((res) => client3.on('connect', res)),
    ]);
    console.log('✓ All 3 test clients connected to server');

    // Test 1: Create room
    let roomCode = '';
    const roomCreatedPromise = new Promise<string>((resolve) => {
      client1.on('room_created', (data: { roomCode: string; playerId: string; isHost: boolean }) => {
        if (!data.isHost) throw new Error('Creator should be host');
        roomCode = data.roomCode;
        resolve(data.roomCode);
      });
    });

    client1.emit('create_room', { playerName: 'Alice' });
    await roomCreatedPromise;
    console.log(`✓ Test 1 Passed: Room created with code "${roomCode}" and host assigned`);

    // Test 2: Invalid room code
    const invalidJoinPromise = new Promise<void>((resolve) => {
      client2.on('error', (err: { message: string }) => {
        if (err.message.includes('not found')) {
          resolve();
        }
      });
    });
    client2.emit('join_room', { roomCode: 'ZZZZ', playerName: 'Bob' });
    await invalidJoinPromise;
    console.log('✓ Test 2 Passed: Invalid room code rejected with proper error message');

    // Test 3: Join valid room
    const joinPromise = new Promise<void>((resolve) => {
      let c1LobbyReceived = false;
      let c2JoinedReceived = false;

      client1.on('lobby_updated', (data: { room: RoomSnapshot }) => {
        if (data.room.players.length === 2) {
          c1LobbyReceived = true;
          if (c1LobbyReceived && c2JoinedReceived) resolve();
        }
      });

      client2.on('room_joined', () => {
        c2JoinedReceived = true;
        if (c1LobbyReceived && c2JoinedReceived) resolve();
      });
    });

    client2.emit('join_room', { roomCode, playerName: 'Bob' });
    await joinPromise;
    console.log('✓ Test 3 Passed: Player 2 successfully joined room and lobby synchronized');

    // Test 4: Host start game countdown
    const countdownPromise = new Promise<void>((resolve) => {
      let c1Count = false;
      let c2Count = false;

      client1.on('game_countdown', () => {
        c1Count = true;
        if (c1Count && c2Count) resolve();
      });

      client2.on('game_countdown', () => {
        c2Count = true;
        if (c1Count && c2Count) resolve();
      });
    });

    client1.emit('start_game');
    await countdownPromise;
    console.log('✓ Test 4 Passed: Host started game and 3s countdown synchronized on all clients');

    // Test 5: Game Started with coins & positions
    const gameStartPromise = new Promise<void>((resolve) => {
      client2.on('game_started', (data: { gameState: RoomSnapshot }) => {
        if (data.gameState.coins.length > 0 && data.gameState.players.length === 2) {
          resolve();
        }
      });
    });
    await gameStartPromise;
    console.log('✓ Test 5 Passed: Game started with active coins and players in arena');

    // Test 6: In-progress join rejected (Security rule)
    const midGameJoinPromise = new Promise<void>((resolve) => {
      client3.on('error', (err: { message: string }) => {
        if (err.message.includes('already in progress')) {
          resolve();
        }
      });
    });
    client3.emit('join_room', { roomCode, playerName: 'Charlie' });
    await midGameJoinPromise;
    console.log('✓ Test 6 Passed: Joining in-progress match was safely rejected');

    // Test 7: Authoritative movement input
    const movementPromise = new Promise<void>((resolve) => {
      let initialX = -1;
      client2.on('game_state', (data) => {
        const p2 = data.players.find((p: any) => p.name === 'Bob');
        if (p2) {
          if (initialX === -1) {
            initialX = p2.x;
          } else if (p2.x !== initialX) {
            resolve();
          }
        }
      });
    });

    client2.emit('player_input', { up: false, down: false, left: false, right: true });
    await movementPromise;
    console.log('✓ Test 7 Passed: Authoritative movement input received and position updated');

    // Test 8: Authoritative coin collection
    const room = roomManager.getRoom(roomCode);
    if (!room) throw new Error('Room not found on server');
    
    // Teleport Alice directly onto first coin
    const firstCoin = room.coins[0];
    const alice = Array.from(room.players.values()).find((p) => p.name === 'Alice');
    if (alice && firstCoin) {
      alice.x = firstCoin.x;
      alice.y = firstCoin.y;
    }

    const coinCollectPromise = new Promise<void>((resolve) => {
      client1.on('coin_collected', (ev: any) => {
        if (ev.playerName === 'Alice' && ev.newScore >= 1) {
          resolve();
        }
      });
    });

    await coinCollectPromise;
    console.log('✓ Test 8 Passed: Authoritative coin collision collected coin and awarded score');

    // Test 9: Host disconnect and host transfer to Bob
    const hostTransferPromise = new Promise<void>((resolve) => {
      client2.on('host_changed', (data: { newHostId: string; newHostName: string }) => {
        if (data.newHostName === 'Bob') {
          resolve();
        }
      });
    });

    client1.disconnect();
    await hostTransferPromise;
    console.log('✓ Test 9 Passed: Host disconnected and host was automatically transferred to Bob');

    // Test 10: Rematch request resets room
    const rematchPromise = new Promise<void>((resolve) => {
      client2.on('rematch_started', () => {
        resolve();
      });
    });

    client2.emit('request_rematch');
    await rematchPromise;
    console.log('✓ Test 10 Passed: Rematch triggered and room reset to lobby');

    console.log('\n==================================================');
    console.log('ALL 10/10 MULTIPLAYER TESTS PASSED COMPLETELY!');
    console.log('==================================================\n');
  } finally {
    client1.close();
    client2.close();
    client3.close();
    await new Promise<void>((res) => httpServer.close(() => res()));
  }
}

runTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
