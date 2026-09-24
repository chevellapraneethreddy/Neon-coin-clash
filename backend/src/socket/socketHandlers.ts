import type { Server, Socket } from 'socket.io';
import type { RoomManager } from '../game/RoomManager.js';
import type { GameManager } from '../game/GameManager.js';
import type { PlayerInput } from '../types/game.js';

export function setupSocketHandlers(
  io: Server,
  roomManager: RoomManager,
  gameManager: GameManager
): void {
  io.on('connection', (socket: Socket) => {
    // 1. Create Room
    socket.on('create_room', (data: { playerName?: string } = {}) => {
      const name = (data.playerName || 'Player 1').trim().slice(0, 15);
      const { code, snapshot } = roomManager.createRoom(socket.id, name);

      socket.join(code);

      socket.emit('room_created', {
        roomCode: code,
        playerId: socket.id,
        isHost: true,
      });

      socket.emit('lobby_updated', { room: snapshot });
    });

    // 2. Join Room
    socket.on('join_room', (data: { roomCode: string; playerName?: string }) => {
      if (!data?.roomCode) {
        socket.emit('error', { message: 'Room code is required.' });
        return;
      }

      const name = (data.playerName || `Player`).trim().slice(0, 15);
      const result = roomManager.joinRoom(data.roomCode, socket.id, name);

      if (!result.success || !result.snapshot) {
        socket.emit('error', { message: result.error || 'Failed to join room.' });
        return;
      }

      const code = result.snapshot.code;
      socket.join(code);

      socket.emit('room_joined', {
        roomCode: code,
        playerId: socket.id,
        isHost: false,
      });

      const joinedPlayer = result.snapshot.players.find((p) => p.id === socket.id);
      if (joinedPlayer) {
        socket.to(code).emit('player_joined', { player: joinedPlayer });
      }

      io.to(code).emit('lobby_updated', { room: result.snapshot });
    });

    // 3. Set Player Name
    socket.on('set_player_name', (data: { name: string }) => {
      const room = roomManager.getRoomByPlayerId(socket.id);
      if (!room || !data?.name) return;

      const player = room.players.get(socket.id);
      if (player) {
        player.name = data.name.trim().slice(0, 15);
        io.to(room.code).emit('lobby_updated', { room: room.toSnapshot() });
      }
    });

    // 4. Start Game (Host only)
    socket.on('start_game', () => {
      const room = roomManager.getRoomByPlayerId(socket.id);
      if (!room) {
        socket.emit('error', { message: 'You are not in a room.' });
        return;
      }

      const result = gameManager.startGame(room.code, socket.id);
      if (!result.success) {
        socket.emit('error', { message: result.error || 'Cannot start game.' });
      }
    });

    // 5. Authoritative Player Input
    socket.on('player_input', (input: PlayerInput) => {
      const room = roomManager.getRoomByPlayerId(socket.id);
      if (!room || room.phase !== 'PLAYING') return;

      room.updatePlayerInput(socket.id, input);
    });

    // 6. Request Rematch
    socket.on('request_rematch', () => {
      const room = roomManager.getRoomByPlayerId(socket.id);
      if (!room) return;

      gameManager.requestRematch(room.code);
    });

    // 7. Leave Room
    const handleLeave = () => {
      const room = roomManager.getRoomByPlayerId(socket.id);
      const playerName = room?.players.get(socket.id)?.name || 'Player';
      
      const { roomCode, wasHost, newHostId, roomEmpty, snapshot } = roomManager.leaveRoom(socket.id);

      if (roomCode) {
        socket.leave(roomCode);

        if (roomEmpty) {
          gameManager.clearRoomTimers(roomCode);
        } else if (snapshot) {
          io.to(roomCode).emit('player_left', {
            playerId: socket.id,
            playerName,
          });

          if (wasHost && newHostId) {
            const newHost = snapshot.players.find((p) => p.id === newHostId);
            io.to(roomCode).emit('host_changed', {
              newHostId,
              newHostName: newHost?.name || 'Player',
            });
          }

          io.to(roomCode).emit('lobby_updated', { room: snapshot });
        }
      }
    };

    socket.on('leave_room', handleLeave);
    socket.on('disconnect', handleLeave);
  });
}
