import { io, Socket } from 'socket.io-client';

export const cleanUrl = (url: string): string => {
  if (!url) return '';
  let clean = url.trim().replace(/\/+$/, '');
  // Remove any accidental trailing path like /socket.io or /health
  clean = clean.replace(/\/socket\.io\/?$/, '').replace(/\/health\/?$/, '');
  return clean;
};

export const getSocketUrl = (): string => {
  // 1. Check production environment variable from Vite/Vercel
  const envUrl = import.meta.env.VITE_SOCKET_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return cleanUrl(envUrl);
  }

  // 2. Check if a custom Render URL was saved in localStorage for quick browser testing
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedUrl = window.localStorage.getItem('ncc_socket_url');
    if (savedUrl && savedUrl.trim() !== '') {
      return cleanUrl(savedUrl);
    }
  }

  // 3. Check if running on localhost or LAN
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocalhost) {
      return 'http://localhost:3001';
    }

    // Local Wi-Fi network testing (e.g. 192.168.x.x or 10.x.x.x)
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return `http://${hostname}:3001`;
    }

    // If running on Vercel or cloud HTTPS and VITE_SOCKET_URL was not set
    console.warn(
      '[Neon Coin Clash] ⚠️ VITE_SOCKET_URL is not set on Vercel! Please configure VITE_SOCKET_URL in your Vercel Project Settings with your Render URL (e.g., https://YOUR-RENDER-BACKEND.onrender.com).'
    );
  }

  return 'http://localhost:3001';
};

export const SOCKET_URL = getSocketUrl();
console.log('[Neon Coin Clash] Initializing Socket.IO connection to:', SOCKET_URL);

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['polling', 'websocket'],
  upgrade: true,
});

// Socket connection diagnostic logging
socket.on('connect', () => {
  console.log('[Neon Coin Clash] 🟢 Socket connected successfully! ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('[Neon Coin Clash] 🔴 Socket connection error to ' + SOCKET_URL + ':', error.message, error);
});

socket.on('disconnect', (reason) => {
  console.log('[Neon Coin Clash] 🟡 Socket disconnected. Reason:', reason);
});
