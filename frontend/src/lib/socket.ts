/**
 * Socket.io client for real-time chat
 * Connects to backend - use NEXT_PUBLIC_API_URL (without /api) for socket URL
 */

import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (typeof window === 'undefined') return '';
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/api\/?$/, '');
  }
  // Dev: talk to backend directly (reliable WebSocket with nodemon/Express on :5001)
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5001';
  }
  // Production: same origin as the Next app — rewrites in next.config.mjs forward /socket.io to the backend
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
