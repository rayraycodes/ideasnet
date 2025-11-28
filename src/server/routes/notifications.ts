import { Router, Request, Response } from 'express';
import { prisma } from '../../utils/database';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../types';

const router = Router();

// Get user notifications
router.get('/', async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { limit = 50, offset = 0 } = req.query;
    const notifications = await prisma.notification.findMany({
      where: { userId: authReq.user!.id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });
    const unreadCount = await prisma.notification.count({
      where: {
        userId: authReq.user!.id,
        isRead: false,
      },
    });
    return res.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    logger.error('Failed to fetch notifications', {
      error: error.message,
      stack: error.stack,
      userId: authReq.user?.id,
    });
    return res.status(500).json({
      error: 'Failed to fetch notifications',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Mark notification as read
router.put('/:id/read', async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    if (!notification || notification.userId !== authReq.user!.id) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return res.json(updated);
  } catch (error: any) {
    logger.error('Failed to mark notification as read', {
      error: error.message,
      stack: error.stack,
      notificationId: req.params.id,
      userId: authReq.user?.id,
    });
    return res.status(500).json({
      error: 'Failed to mark notification as read',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Mark all notifications as read
router.put('/read-all', async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    await prisma.notification.updateMany({
      where: {
        userId: authReq.user!.id,
        isRead: false,
      },
      data: { isRead: true },
    });
    return res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    logger.error('Failed to mark all notifications as read', {
      error: error.message,
      stack: error.stack,
      userId: authReq.user?.id,
    });
    return res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router; 