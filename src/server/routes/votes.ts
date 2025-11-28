import { Router } from 'express';
import { prisma } from '../../utils/database';
import { authMiddleware } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { logger } from '../../utils/logger';

const router = Router();

// Vote on idea
router.post('/idea/:ideaId', authMiddleware, async (req: any, res) => {
  try {
    const { ideaId } = req.params;
    const { type } = req.body; // type: 'UPVOTE', 'INVEST_INTEREST', 'WOULD_USE', etc.
    if (!['UPVOTE', 'INVEST_INTEREST', 'WOULD_USE', 'WOULD_PAY', 'DOWNVOTE'].includes(type)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }
    // Prevent duplicate votes
    const existing = await prisma.vote.findUnique({
      where: {
        userId_ideaId_type: {
          userId: req.user!.id,
          ideaId,
          type,
        },
      },
    });
    if (existing) {
      return res.status(400).json({ error: 'Already voted' });
    }
    // Create vote
    await prisma.vote.create({
      data: {
        userId: req.user!.id,
        ideaId,
        type,
      },
    });
    // Update idea count
    let field = '';
    if (type === 'UPVOTE') field = 'upvoteCount';
    if (type === 'INVEST_INTEREST') field = 'investInterestCount';
    if (type === 'WOULD_USE') field = 'wouldUseCount';
    if (type === 'WOULD_PAY') field = 'wouldPayCount';
    if (type === 'DOWNVOTE') field = 'downvoteCount';
    if (field) {
      await prisma.idea.update({
        where: { id: ideaId },
        data: { [field]: { increment: 1 } },
      });
    }
    return res.json({ message: 'Vote added' });
  } catch (error: any) {
    logger.error('Failed to vote on idea', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      ideaId: req.params.ideaId,
      userId: req.user?.id
    });
    return res.status(500).json({ 
      error: 'Failed to vote',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user votes for an idea
router.get('/idea/:ideaId/user', authMiddleware, async (req: any, res) => {
  try {
    const { ideaId } = req.params;
    const votes = await prisma.vote.findMany({
      where: {
        userId: req.user!.id,
        ideaId,
      },
      select: {
        type: true,
      },
    });
    res.json(votes.map(v => v.type));
  } catch (error: any) {
    logger.error('Failed to fetch user votes', {
      error: error.message,
      stack: error.stack,
      ideaId: req.params.ideaId,
      userId: req.user?.id
    });
    res.status(500).json({ 
      error: 'Failed to fetch user votes',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Vote on comment
router.post('/comment/:commentId', async (req, res) => {
  return res.json({ message: 'Vote on comment' });
});

// Remove vote
router.delete('/idea/:ideaId', authMiddleware, async (req: any, res) => {
  try {
    const { ideaId } = req.params;
    const { type } = req.body; // type: 'UPVOTE', etc.
    const existing = await prisma.vote.findUnique({
      where: {
        userId_ideaId_type: {
          userId: req.user!.id,
          ideaId,
          type,
        },
      },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Vote not found' });
    }
    await prisma.vote.delete({
      where: { id: existing.id },
    });
    // Update idea count
    let field = '';
    if (type === 'UPVOTE') field = 'upvoteCount';
    if (type === 'INVEST_INTEREST') field = 'investInterestCount';
    if (type === 'WOULD_USE') field = 'wouldUseCount';
    if (type === 'WOULD_PAY') field = 'wouldPayCount';
    if (type === 'DOWNVOTE') field = 'downvoteCount';
    if (field) {
      await prisma.idea.update({
        where: { id: ideaId },
        data: { [field]: { decrement: 1 } },
      });
    }
    return res.json({ message: 'Vote removed' });
  } catch (error: any) {
    logger.error('Failed to remove vote', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      ideaId: req.params.ideaId,
      userId: req.user?.id
    });
    return res.status(500).json({ 
      error: 'Failed to remove vote',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 