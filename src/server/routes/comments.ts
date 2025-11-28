import { Router, Request, Response } from 'express';
import { prisma } from '../../utils/database';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { logger } from '../../utils/logger';

const router = Router();

// Get comments for an idea
router.get('/idea/:ideaId', async (req: Request, res: Response) => {
  try {
    const { ideaId } = req.params;
    const comments = await prisma.comment.findMany({
      where: {
        ideaId,
        isDeleted: false,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        replies: {
          where: { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(comments);
  } catch (error: any) {
    logger.error('Failed to fetch comments', {
      error: error.message,
      stack: error.stack,
      ideaId: req.params.ideaId,
    });
    return res.status(500).json({
      error: 'Failed to fetch comments',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Create comment
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const { content, ideaId, parentId, type } = req.body;
    if (!content || !ideaId) {
      return res.status(400).json({ error: 'Missing required fields: content, ideaId' });
    }
    const comment = await prisma.comment.create({
      data: {
        content,
        ideaId,
        parentId: parentId || null,
        authorId: req.user!.id,
        type: type || 'FEEDBACK',
      },
      include: {
        author: {
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
    return res.status(201).json(comment);
  } catch (error: any) {
    logger.error('Failed to create comment', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    return res.status(500).json({
      error: 'Failed to create comment',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Update comment
router.put('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (existing.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await prisma.comment.update({
      where: { id },
      data: {
        content,
        isEdited: true,
      },
      include: {
        author: {
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
    return res.json(updated);
  } catch (error: any) {
    logger.error('Failed to update comment', {
      error: error.message,
      stack: error.stack,
      commentId: req.params.id,
      userId: req.user?.id,
    });
    return res.status(500).json({
      error: 'Failed to update comment',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Delete comment
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (existing.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.comment.update({
      where: { id },
      data: { isDeleted: true },
    });
    return res.json({ message: 'Comment deleted' });
  } catch (error: any) {
    logger.error('Failed to delete comment', {
      error: error.message,
      stack: error.stack,
      commentId: req.params.id,
      userId: req.user?.id,
    });
    return res.status(500).json({
      error: 'Failed to delete comment',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router; 