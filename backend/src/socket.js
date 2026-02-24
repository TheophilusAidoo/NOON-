/**
 * Socket.io server for real-time chat (Seller <-> Admin)
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from './config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;

let ioInstance = null;

export function getIO() {
  return ioInstance;
}

export function setupSocket(server) {
  ioInstance = new Server(server, {
    cors: { origin: true, credentials: true },
    path: '/socket.io',
  });

  const userSockets = new Map(); // userId -> Set of socketIds

  ioInstance.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('Auth required'));

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, role: true },
      });
      if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
        return next(new Error('Invalid user role'));
      }
      socket.userId = user.id;
      socket.userRole = user.role;
      socket.userName = user.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const uid = socket.userId;
    if (!userSockets.has(uid)) userSockets.set(uid, new Set());
    userSockets.get(uid).add(socket.id);

    socket.join(`user:${uid}`);

    socket.on('chat:send', async (payload) => {
      const { receiverId, content } = payload || {};
      if (!receiverId || !content || typeof content !== 'string' || content.trim().length === 0) return;

      try {
        const chatModel = prisma.chatMessage;
        if (!chatModel) {
          return socket.emit('chat:error', { message: 'Chat not ready. Run: npx prisma generate && restart server' });
        }
        const msg = await chatModel.create({
          data: {
            senderId: uid,
            receiverId,
            content: content.trim(),
          },
          include: {
            sender: { select: { id: true, name: true } },
          },
        });

        ioInstance.to(`user:${receiverId}`).emit('chat:message', msg);
        socket.emit('chat:message', msg);
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      const set = userSockets.get(uid);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) userSockets.delete(uid);
      }
    });
  });

  return ioInstance;
}
