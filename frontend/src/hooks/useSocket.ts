import { useEffect, useState, useCallback, useRef } from 'react';
import { socket } from '../lib/socket.js';
import { sounds } from '../lib/sound.js';
import type {
  Coin,
  CoinCollectedEvent,
  GamePhase,
  GameStateBroadcast,
  Player,
  PlayerInput,
  ResultsData,
  RoomSnapshot,
} from '../types/game.js';

export function useSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(socket.id || null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [phase, setPhase] = useState<GamePhase>('LOBBY');
  const [players, setPlayers] = useState<Player[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentPickup, setRecentPickup] = useState<{ id: string; x: number; y: number; text: string } | null>(null);

  const lastInputRef = useRef<PlayerInput>({ up: false, down: false, left: false, right: false });

  // Clear transient error message after 4s
  const showError = useCallback((msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  }, []);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setPlayerId(socket.id || null);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onRoomCreated(data: { roomCode: string; playerId: string; isHost: boolean }) {
      setRoomCode(data.roomCode);
      setPlayerId(data.playerId);
      setIsHost(data.isHost);
      setPhase('LOBBY');
      setResults(null);
    }

    function onRoomJoined(data: { roomCode: string; playerId: string; isHost: boolean }) {
      setRoomCode(data.roomCode);
      setPlayerId(data.playerId);
      setIsHost(data.isHost);
      setPhase('LOBBY');
      setResults(null);
    }

    function onLobbyUpdated(data: { room: RoomSnapshot }) {
      if (data?.room) {
        setRoomCode(data.room.code);
        setPlayers(data.room.players);
        setPhase(data.room.phase);
        setTimeLeft(data.room.timeLeft);
        if (socket.id) {
          setIsHost(data.room.hostId === socket.id);
        }
      }
    }

    function onHostChanged(data: { newHostId: string; newHostName: string }) {
      if (socket.id) {
        setIsHost(data.newHostId === socket.id);
      }
    }

    function onGameCountdown(data: { count: number }) {
      setPhase('COUNTDOWN');
      setCountdown(data.count);
      sounds.playCountdown();
    }

    function onGameStarted(data: { gameState: RoomSnapshot }) {
      setPhase('PLAYING');
      setCountdown(null);
      setPlayers(data.gameState.players);
      setCoins(data.gameState.coins);
      setTimeLeft(data.gameState.timeLeft);
      setResults(null);
      sounds.playGameStart();
    }

    function onGameState(data: GameStateBroadcast) {
      if (data) {
        setPlayers(data.players);
        setCoins(data.coins);
        setTimeLeft(data.timeLeft);
        setPhase(data.phase);
      }
    }

    function onCoinCollected(event: CoinCollectedEvent) {
      sounds.playCoin();
      setRecentPickup({
        id: event.coinId,
        x: event.newCoin.x,
        y: event.newCoin.y,
        text: `+1 ${event.playerName}`,
      });
      setTimeout(() => setRecentPickup(null), 1200);
    }

    function onScoreUpdated(data: { scores: Record<string, number> }) {
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          score: data.scores[p.id] !== undefined ? data.scores[p.id] : p.score,
        }))
      );
    }

    function onGameTimer(data: { timeLeft: number }) {
      setTimeLeft(data.timeLeft);
    }

    function onGameOver(data: ResultsData) {
      setPhase('GAME_OVER');
      setResults(data);
      sounds.playWin();
    }

    function onRematchStarted(data: { gameState: RoomSnapshot }) {
      setPhase('LOBBY');
      setResults(null);
      setCountdown(null);
      setPlayers(data.gameState.players);
      setCoins([]);
      setTimeLeft(data.gameState.timeLeft);
    }

    function onError(data: { message: string }) {
      showError(data.message || 'An error occurred.');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room_created', onRoomCreated);
    socket.on('room_joined', onRoomJoined);
    socket.on('lobby_updated', onLobbyUpdated);
    socket.on('host_changed', onHostChanged);
    socket.on('game_countdown', onGameCountdown);
    socket.on('game_started', onGameStarted);
    socket.on('game_state', onGameState);
    socket.on('coin_collected', onCoinCollected);
    socket.on('score_updated', onScoreUpdated);
    socket.on('game_timer', onGameTimer);
    socket.on('game_over', onGameOver);
    socket.on('results', onGameOver);
    socket.on('rematch_started', onRematchStarted);
    socket.on('error', onError);

    if (socket.connected) {
      setIsConnected(true);
      setPlayerId(socket.id || null);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room_created', onRoomCreated);
      socket.off('room_joined', onRoomJoined);
      socket.off('lobby_updated', onLobbyUpdated);
      socket.off('host_changed', onHostChanged);
      socket.off('game_countdown', onGameCountdown);
      socket.off('game_started', onGameStarted);
      socket.off('game_state', onGameState);
      socket.off('coin_collected', onCoinCollected);
      socket.off('score_updated', onScoreUpdated);
      socket.off('game_timer', onGameTimer);
      socket.off('game_over', onGameOver);
      socket.off('results', onGameOver);
      socket.off('rematch_started', onRematchStarted);
      socket.off('error', onError);
    };
  }, [showError]);

  const createRoom = useCallback((playerName: string) => {
    socket.emit('create_room', { playerName });
  }, []);

  const joinRoom = useCallback((code: string, playerName: string) => {
    socket.emit('join_room', { roomCode: code.toUpperCase(), playerName });
  }, []);

  const startGame = useCallback(() => {
    socket.emit('start_game');
  }, []);

  const sendInput = useCallback((input: PlayerInput) => {
    const last = lastInputRef.current;
    if (
      last.up !== input.up ||
      last.down !== input.down ||
      last.left !== input.left ||
      last.right !== input.right
    ) {
      lastInputRef.current = { ...input };
      socket.emit('player_input', input);
    }
  }, []);

  const requestRematch = useCallback(() => {
    socket.emit('request_rematch');
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit('leave_room');
    setRoomCode(null);
    setPhase('LOBBY');
    setResults(null);
    setPlayers([]);
    setCoins([]);
  }, []);

  return {
    isConnected,
    roomCode,
    playerId,
    isHost,
    phase,
    players,
    coins,
    timeLeft,
    countdown,
    results,
    errorMessage,
    recentPickup,
    createRoom,
    joinRoom,
    startGame,
    sendInput,
    requestRematch,
    leaveRoom,
  };
}
