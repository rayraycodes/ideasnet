import { Router, Request, Response } from 'express';
import { prisma } from '../../utils/database';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../types';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// Get conversations
router.get('/conversations', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    // Get all unique users the current user has messaged or received messages from
    const sentMessages = await prisma.message.findMany({
      where: { senderId: authReq.user!.id },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });
    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: authReq.user!.id },
      select: { senderId: true },
      distinct: ['senderId'],
    });
    const userIds = new Set([
      ...sentMessages.map((m) => m.receiverId),
      ...receivedMessages.map((m) => m.senderId),
    ]);
    const conversations = await Promise.all(
      Array.from(userIds).map(async (userId) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: authReq.user!.id, receiverId: userId },
              { senderId: userId, receiverId: authReq.user!.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
        const unreadCount = await prisma.message.count({
          where: {
            senderId: userId,
            receiverId: authReq.user!.id,
            isRead: false,
          },
        });
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        });
        return {
          user,
          lastMessage,
          unreadCount,
        };
      })
    );
    return res.json(conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || new Date(0);
      const bTime = b.lastMessage?.createdAt || new Date(0);
      return bTime.getTime() - aTime.getTime();
    }));
  } catch (error: any) {
    logger.error('Failed to fetch conversations', {
      error: error.message,
      stack: error.stack,
      userId: authReq.user?.id,
    });
    return res.status(500).json({
      error: 'Failed to fetch conversations',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get messages with user
router.get('/user/:userId', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: authReq.user!.id, receiverId: userId },
          { senderId: userId, receiverId: authReq.user!.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });
    return res.json(messages.reverse()); // Reverse to show oldest first
  } catch (error: any) {
    logger.error('Failed to fetch messages', {
      error: error.message,
      stack: error.stack,
      userId: authReq.user?.id,
      targetUserId: req.params.userId,
    });
    return res.status(500).json({
      error: 'Failed to fetch messages',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Send message
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields: receiverId, content' });
    }
    const message = await prisma.message.create({
      data: {
        senderId: authReq.user!.id,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return res.status(201).json(message);
  } catch (error: any) {
    logger.error('Failed to send message', {
      error: error.message,
      stack: error.stack,
      userId: authReq.user?.id,
    });
    return res.status(500).json({
      error: 'Failed to send message',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Mark messages as read
router.put('/read/:userId', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { userId } = req.params;
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: authReq.user!.id,
        isRead: false,
      },
      data: { isRead: true },
    });
    return res.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    logger.error('Failed to mark messages as read', {
      error: error.message,
      stack: error.stack,
      userId: authReq.user?.id,
      targetUserId: req.params.userId,
    });
    return res.status(500).json({
      error: 'Failed to mark messages as read',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router; 