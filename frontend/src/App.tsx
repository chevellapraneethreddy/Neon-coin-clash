import React, { useState } from 'react';
import { useSocket } from './hooks/useSocket.js';
import { Home } from './components/Home.js';
import { CreateRoom } from './components/CreateRoom.js';
import { JoinRoom } from './components/JoinRoom.js';
import { Lobby } from './components/Lobby.js';
import { Countdown } from './components/Countdown.js';
import { GameArena } from './components/GameArena.js';
import { Results } from './components/Results.js';
import { AlertCircle } from 'lucide-react';

type PreLobbyScreen = 'HOME' | 'CREATE' | 'JOIN';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<PreLobbyScreen>('HOME');
  const [savedName, setSavedName] = useState<string>(() => {
    return localStorage.getItem('ncc_player_name') || 'Player 1';
  });

  const {
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
  } = useSocket();

  // Handlers from Home / Pre-Lobby views
  const handleCreateRoom = (name: string) => {
    setSavedName(name);
    createRoom(name);
  };

  const handleJoinRoom = (code: string, name: string) => {
    setSavedName(name);
    joinRoom(code, name);
  };

  const handleLeave = () => {
    leaveRoom();
    setScreen('HOME');
  };

  return (
    <div className="min-h-screen bg-[#070712] text-white flex flex-col relative overflow-hidden font-cyber">
      {/* Global Error Banner Toast */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-rose-950/90 border border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-2 text-rose-200 text-sm font-arcade animate-bounce">
          <AlertCircle size={18} className="text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Flow Controller */}
      {!roomCode ? (
        // Not yet in a room (HOME, CREATE, JOIN)
        <>
          {screen === 'HOME' && (
            <Home
              onCreateRoom={(name) => {
                setSavedName(name);
                createRoom(name);
              }}
              onJoinRoomClick={(name) => {
                setSavedName(name);
                setScreen('JOIN');
              }}
              isConnected={isConnected}
            />
          )}

          {screen === 'CREATE' && (
            <CreateRoom
              initialName={savedName}
              onCreate={handleCreateRoom}
              onBack={() => setScreen('HOME')}
            />
          )}

          {screen === 'JOIN' && (
            <JoinRoom
              initialName={savedName}
              onJoin={handleJoinRoom}
              onBack={() => setScreen('HOME')}
            />
          )}
        </>
      ) : (
        // Connected to Room
        <>
          {phase === 'LOBBY' && (
            <Lobby
              roomCode={roomCode}
              players={players}
              currentPlayerId={playerId}
              isHost={isHost}
              onStartGame={startGame}
              onLeaveRoom={handleLeave}
            />
          )}

          {phase === 'COUNTDOWN' && (
            <>
              <GameArena
                players={players}
                coins={coins}
                timeLeft={timeLeft}
                currentPlayerId={playerId}
                onSendInput={sendInput}
                recentPickup={recentPickup}
                onLeaveRoom={handleLeave}
              />
              <Countdown count={countdown ?? 3} />
            </>
          )}

          {phase === 'PLAYING' && (
            <GameArena
              players={players}
              coins={coins}
              timeLeft={timeLeft}
              currentPlayerId={playerId}
              onSendInput={sendInput}
              recentPickup={recentPickup}
              onLeaveRoom={handleLeave}
            />
          )}

          {phase === 'GAME_OVER' && results && (
            <Results
              results={results}
              currentPlayerId={playerId}
              isHost={isHost}
              onRematch={requestRematch}
              onLeave={handleLeave}
            />
          )}
        </>
      )}
    </div>
  );
};
