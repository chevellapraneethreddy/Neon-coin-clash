# 🪙 Neon Coin Clash

> Fast-paced, real-time multiplayer arcade coin battle game for 2–8 players built with React, TypeScript, Vite, Node.js, Express, and Socket.IO.

![Game Banner](https://img.shields.io/badge/Arcade-Multiplayer-00f5ff?style=for-the-badge&logo=retro-arch&logoColor=black)
![Frontend](https://img.shields.io/badge/Frontend-React_19_|_Vite_7_|_Tailwind_CSS-ff007f?style=for-the-badge&logo=react&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Node.js_|_Express_|_Socket.IO-39ff14?style=for-the-badge&logo=node.js&logoColor=black)
![Deployment](https://img.shields.io/badge/Deploy-Vercel_+_Render-ffe600?style=for-the-badge&logo=vercel&logoColor=black)

---

## 1. Project Overview

**Neon Coin Clash** is a real-time multiplayer arcade game where 2 to 8 players join a shared room via a short 4-character code, pilot glowing neon hovercrafts inside a dynamic cyber arena, and race to collect coins.

- **Objective:** First player to collect **10 coins** wins!
- **Time Limit:** If no player reaches 10 coins before the **60-second timer** expires, the player with the highest score takes the crown.
- **True Multiplayer:** Server-authoritative physics, collision detection, and coin spawns. No client-side score spoofing or simulated local storage.
- **Cross-Platform:** Responsive SVG arena with full support for desktop (WASD / Arrow keys) and mobile/tablets (Virtual Analog Joystick & Touch D-Pad).

---

## 2. Features

- **Authoritative Real-Time Networking:** 30Hz game physics tick loop running on Node.js + Socket.IO.
- **Lobby & Room System:**
  - 4-letter room codes for quick joining.
  - 2 to 8 players per room.
  - Automatic host migration if the current host disconnects.
  - Real-time connection status and player roster.
- **Interactive Gameplay:**
  - Glowing neon avatars with dynamic directional thrusters.
  - Continuous coin spawns with duplicate-pickup prevention.
  - Live HUD scoreboard and warning-tier timer (urgent amber at 15s, flashing red at 5s).
  - Sound synthesis via Web Audio API (coin pickup, countdown beeps, start chime, victory fanfare) — zero asset latency.
- **Post-Game & Rematch:**
  - Victory podium with animated confetti celebrations.
  - Instant one-click rematch resetting player scores, arena positions, and lobby state.
- **Zero Install / Zero Login:** Instant browser access on any phone, tablet, or PC.

---

## 3. Architecture

```text
neon-coin-clash/
├── backend/                  # Node.js + TypeScript Authoritative Server
│   ├── src/
│   │   ├── config.ts         # Server settings, arena bounds, game rules, neon palette
│   │   ├── server.ts         # Express HTTP + Socket.IO server, /health endpoint, CORS
│   │   ├── socket/
│   │   │   └── socketHandlers.ts # Socket event listeners & room event emitters
│   │   ├── game/
│   │   │   ├── GameManager.ts    # Countdown, 30Hz physics tick, timer loop, victory resolution
│   │   │   ├── RoomManager.ts    # Room code generation, join validation, host migration
│   │   │   ├── GameState.ts      # Authoritative state, input handling, coin collisions
│   │   │   └── collision.ts      # Circle-to-circle collision & safe arena bounds
│   │   ├── types/
│   │   │   └── game.ts           # Game types & socket contracts
│   │   └── multiplayer.test.ts   # Automated 10-point multiplayer test suite
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                 # React + TypeScript + Vite + Tailwind Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.tsx          # Neon title, pilot handle input, sound toggle, menu actions
│   │   │   ├── CreateRoom.tsx    # Room creation view
│   │   │   ├── JoinRoom.tsx      # Room code input & validation
│   │   │   ├── Lobby.tsx         # Player roster, room code copy, host start controls
│   │   │   ├── Countdown.tsx     # 3-2-1 match countdown overlay
│   │   │   ├── GameArena.tsx     # Responsive SVG arena (1000x600 coordinate space)
│   │   │   ├── Player.tsx        # Neon avatar with directional thruster & floating nameplate
│   │   │   ├── Coin.tsx          # Spinning golden coin with glow ring
│   │   │   ├── ScoreBoard.tsx    # Real-time player leaderboard with micro progress bars
│   │   │   ├── GameTimer.tsx     # Synchronized round countdown timer
│   │   │   ├── MobileControls.tsx# Virtual analog joystick & discrete 4-way D-pad
│   │   │   └── Results.tsx       # Podium screen, score breakdown & rematch button
│   │   ├── hooks/
│   │   │   └── useSocket.ts      # Socket.IO connection & event dispatch hook
│   │   ├── lib/
│   │   │   ├── socket.ts         # Socket.IO client instance with LAN IP fallback
│   │   │   └── sound.ts          # Web Audio API retro arcade sound synthesizers
│   │   ├── types/
│   │   │   └── game.ts           # Client-side game types
│   │   ├── App.tsx               # Screen state controller & error toast system
│   │   ├── main.tsx              # React DOM entry point
│   │   └── index.css             # Neon glow utilities, cyber grid & custom typography
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── .gitignore
├── package.json              # Monorepo root dev & build scripts
└── README.md
```

---

## 4. Environment Variables

### Backend (`backend/.env`)
```bash
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```bash
# Set to your deployed Render URL for production (e.g., https://neon-coin-clash-api.onrender.com)
# Leave blank for local development (defaults to localhost:3001 / current LAN IP)
VITE_SOCKET_URL=http://localhost:3001
```

> ⚠️ **Never commit `.env` files.** Use `.env.example` templates provided in both folders.

---

## 5. Local Development

### Prerequisites
- Node.js 18+ installed
- npm installed

### Quick Start (Both Frontend & Backend concurrently)
```bash
# Clone the repository
git clone https://github.com/chevellapraneethreddy/Neon-coin-clash.git
cd Neon-coin-clash

# Install all dependencies
npm run install:all

# Run both servers concurrently
npm run dev
```

The game is now accessible at:
- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:3001`
- **Health Check:** `http://localhost:3001/health`

---

## 6. How to Run Frontend Individually

```bash
cd frontend
npm install
npm run dev
```

Build for production:
```bash
npm run build
npm run preview
```

---

## 7. How to Run Backend Individually

```bash
cd backend
npm install
npm run dev
```

Run automated multiplayer integration tests:
```bash
npm run test:multiplayer
```

Compile and run production server:
```bash
npm run build
npm start
```

---

## 8. GitHub Setup

To connect and push this repository to GitHub:

```bash
git remote add origin https://github.com/chevellapraneethreddy/Neon-coin-clash.git
git branch -M main
git push -u origin main
```

---

## 9. Vercel Frontend Deployment

1. Go to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New Project** and import the `Neon-coin-clash` repository.
3. Configure the project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click "Edit" and choose `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the Environment Variable in Vercel:
   - `VITE_SOCKET_URL`: `https://YOUR-RENDER-BACKEND.onrender.com`
5. Click **Deploy**.

---

## 10. Render Backend Deployment

1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `Neon-coin-clash`.
4. Configure service settings:
   - **Name:** `neon-coin-clash-server`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   - `PORT`: `10000` (Render assigns automatically, but 10000 or 3001 is supported)
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://YOUR-VERCEL-FRONTEND.vercel.app`
6. Click **Create Web Service**.
7. Once deployed, verify `https://YOUR-RENDER-BACKEND.onrender.com/health` returns `{"status":"ok"}`.

---

## 11. Production Configuration & CORS

The backend server dynamically validates incoming CORS origins:
- `CLIENT_URL` environment variable allows cross-origin requests from your Vercel domain.
- WebSocket upgrades and polling transports are supported.
- `GET /health` is publicly exposed for uptime monitoring and health checks on Render.

---

## 12. Multiplayer Testing

### Local Multi-Device / Multi-Tab Testing:
1. Start the dev server (`npm run dev`).
2. Open `http://localhost:5173` in Tab A -> Click **Create Room** (e.g., Name: "Alice").
3. Copy the 4-letter room code (e.g., `7X3K`).
4. Open an Incognito window or Tab B -> Click **Join Room** (e.g., Name: "Bob") -> Enter code.
5. In Tab A (Host), click **Start Battle**.
6. Observe the synchronized 3-second countdown, real-time avatar movement, coin collection, and leaderboard score updates!

### Mobile & LAN Testing:
1. Find your computer's local IP address (e.g., `192.168.1.15`).
2. Open `http://192.168.1.15:5173` on your smartphone browser (connected to the same Wi-Fi).
3. The client will automatically connect to your computer's backend and enable the virtual touch joystick and D-pad.

---

## License

MIT © 2026 Neon Coin Clash
