/**
 * Chat Controller - Seller <-> Admin real-time chat
 */

import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';
import { getIO } from '../socket.js';

const MESSAGES_LIMIT = 100;

function getChatModel() {
  const model = prisma.chatMessage;
  if (!model) {
    throw new AppError('Prisma client out of date. Run: cd backend && npx prisma generate && restart server', 503);
  }
  return model;
}

/** Get admin user ID for seller-to-admin chat (first admin) */
async function getSupportAdminId() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  });
  return admin?.id ?? null;
}

/** Seller: get admin contact for socket */
export const getSellerChatAdmin = async (req, res, next) => {
  try {
    const adminId = await getSupportAdminId();
    if (!adminId) {
      return res.json({ success: true, data: { adminId: null, admin: null } });
    }
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, email: true },
    });
    res.json({ success: true, data: { adminId, admin } });
  } catch (err) {
    next(err);
  }
};

/** Seller: get messages with admin */
export const getSellerChatMessages = async (req, res, next) => {
  try {
    const adminId = await getSupportAdminId();
    if (!adminId) {
      return res.json({ success: true, data: { messages: [], otherUser: null } });
    }

    let messages = [];
    try {
      messages = await getChatModel().findMany({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: adminId },
            { senderId: adminId, receiverId: req.user.id },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: MESSAGES_LIMIT,
        include: {
          sender: { select: { id: true, name: true } },
        },
      });
    } catch (chatErr) {
      console.warn('[getSellerChatMessages] chat_messages table may not exist:', chatErr.message);
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, email: true },
    });

    res.json({
      success: true,
      data: {
        messages,
        otherUser: admin,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** Seller: send message to admin */
export const sendSellerMessage = async (req, res, next) => {
  try {
    const { content, imageUrl } = req.body;
    const text = typeof content === 'string' ? content.trim() : '';
    const img = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null;
    if (!text && !img) {
      throw new AppError('Message content or image is required', 400);
    }

    const adminId = await getSupportAdminId();
    if (!adminId) {
      throw new AppError('Admin support is not available', 503);
    }

    let msg;
    try {
      msg = await getChatModel().create({
      data: {
        senderId: req.user.id,
        receiverId: adminId,
        content: text || '',
        imageUrl: img,
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
      });
    } catch (dbErr) {
      console.error('[sendSellerMessage]', dbErr);
      throw new AppError(dbErr.message || 'Chat not available. Run database/add-chat-messages.sql in MySQL.', 503);
    }

    const io = getIO();
    if (io) io.to(`user:${adminId}`).emit('chat:message', msg);

    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

/** Admin: list all approved sellers (for chat - with last message if any) */
export const getAdminChatSellers = async (req, res, next) => {
  try {
    const rows = await prisma.user.findMany({
      where: { role: 'SELLER', isApproved: true },
      select: { id: true, name: true, email: true },
    });
    const seen = new Set();
    const sellers = rows.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    let withLastMessage = sellers;
    try {
      withLastMessage = await Promise.all(
        sellers.map(async (s) => {
          const last = await getChatModel().findFirst({
            where: {
              OR: [
                { senderId: s.id, receiverId: req.user.id },
                { senderId: req.user.id, receiverId: s.id },
              ],
            },
            orderBy: { createdAt: 'desc' },
            select: { content: true, createdAt: true, senderId: true },
          });
          return { ...s, lastMessage: last };
        })
      );
    } catch (chatErr) {
      console.warn('[getAdminChatSellers] chat_messages table may not exist:', chatErr.message);
      withLastMessage = sellers.map((s) => ({ ...s, lastMessage: null }));
    }

    res.json({ success: true, data: withLastMessage });
  } catch (err) {
    next(err);
  }
};

/** Admin: get messages with a specific seller */
export const getAdminChatMessages = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId) throw new AppError('Seller ID required', 400);

    const seller = await prisma.user.findUnique({
      where: { id: sellerId, role: 'SELLER' },
    });
    if (!seller) throw new AppError('Seller not found', 404);

    let messages = [];
    try {
      messages = await getChatModel().findMany({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: sellerId },
            { senderId: sellerId, receiverId: req.user.id },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: MESSAGES_LIMIT,
        include: {
          sender: { select: { id: true, name: true } },
        },
      });
    } catch (chatErr) {
      console.warn('[getAdminChatMessages] chat_messages table may not exist:', chatErr.message);
    }

    res.json({
      success: true,
      data: {
        messages,
        otherUser: { id: seller.id, name: seller.name, email: seller.email },
      },
    });
  } catch (err) {
    next(err);
  }
};

/** Admin: send message to seller */
export const sendAdminMessage = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { content, imageUrl } = req.body;

    if (!sellerId) throw new AppError('Seller ID required', 400);
    const text = typeof content === 'string' ? content.trim() : '';
    const img = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null;
    if (!text && !img) {
      throw new AppError('Message content or image is required', 400);
    }

    const seller = await prisma.user.findUnique({
      where: { id: sellerId, role: 'SELLER' },
    });
    if (!seller) throw new AppError('Seller not found', 404);

    let msg;
    try {
      msg = await getChatModel().create({
        data: {
          senderId: req.user.id,
          receiverId: sellerId,
          content: text || '',
          imageUrl: img,
        },
        include: {
          sender: { select: { id: true, name: true } },
        },
      });
    } catch (dbErr) {
      console.error('[sendAdminMessage]', dbErr);
      throw new AppError(dbErr.message || 'Chat not available. Run database/add-chat-messages.sql in MySQL.', 503);
    }

    const io = getIO();
    if (io) io.to(`user:${sellerId}`).emit('chat:message', msg);

    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};
