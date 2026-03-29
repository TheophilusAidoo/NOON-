/**
 * Socket.io client for real-time chat
 * Connects to backend - use NEXT_PUBLIC_API_URL (without /api) for socket URL
 */

import { io } from 'socket.io-client';

function localBackendOrigin() {
  return 'http://localhost:5001';
}

const getSocketUrl = () => {
  if (typeof window === 'undefined') return '';
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/api\/?$/, '');
  }
  const host = window.location.hostname;
  const isLoopback =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]';
  // next dev and next start on this machine: connect straight to Express (Next rewrites often break Socket.IO WS)
  if (isLoopback) {
    return localBackendOrigin();
  }
  // Deployed: same origin; next.config rewrites /socket.io to the backend
  return window.location.origin;
};

export function createChatSocket(token: string | null) {
  if (!token) return null;
  const url = getSocketUrl();
  if (!url) return null;

  return io(url, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
  });
}
