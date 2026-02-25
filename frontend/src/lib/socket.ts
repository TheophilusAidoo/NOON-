/**
 * Socket.io client for real-time chat
 * Connects to backend - use NEXT_PUBLIC_API_URL (without /api) for socket URL
 */

import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (typeof window === 'undefined') return '';
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  return base.replace(/\/api\/?$/, '');
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
