import { Router } from 'express';
import { AuthRequest } from '../../types';
import { prisma } from '../../utils/database';
import { logger } from '../../utils/logger';

const router = Router();

// Get current user profile
router.get('/me', async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        skills: true,
        interests: true,
        location: true,
        website: true,
        linkedin: true,
        twitter: true,
        github: true,
        isVerified: true,
        isPremium: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ideas: true,
            comments: true,
            votes: true,
            followers: true,
            following: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error: any) {
    logger.error('Failed to fetch user profile', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    return res.status(500).json({
      error: 'Failed to fetch user profile',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get user by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        skills: true,
        interests: true,
        location: true,
        website: true,
        linkedin: true,
        twitter: true,
        github: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            ideas: true,
            comments: true,
            votes: true,
            followers: true,
            following: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error: any) {
    logger.error('Failed to fetch user by username', {
      error: error.message,
      stack: error.stack,
      username: req.params.username,
    });
    return res.status(500).json({
      error: 'Failed to fetch user',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get user's ideas
router.get('/:userId/ideas', async (req: any, res) => {
  try {
    const { userId } = req.params;
    const ideas = await prisma.idea.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, firstName: true, lastName: true, avatar: true } },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });
    
    // Transform the data to include counts
    const ideasWithCounts = ideas.map(idea => ({
      ...idea,
      upvoteCount: idea._count?.votes || 0,
      commentCount: idea._count?.comments || 0,
    }));
    
    return res.json(ideasWithCounts);
  } catch (error: any) {
    logger.error('Failed to fetch user ideas', {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId,
    });
    return res.status(500).json({
      error: 'Failed to fetch user ideas',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Update user profile
router.put('/me', async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const {
      firstName,
      lastName,
      bio,
      avatar,
      skills,
      interests,
      location,
      website,
      linkedin,
      twitter,
      github,
    } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        bio,
        avatar,
        skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim())) : undefined,
        interests: interests ? (Array.isArray(interests) ? interests : interests.split(',').map((i: string) => i.trim())) : undefined,
        location,
        website,
        linkedin,
        twitter,
        github,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        skills: true,
        interests: true,
        location: true,
        website: true,
        linkedin: true,
        twitter: true,
        github: true,
        isVerified: true,
        isPremium: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.json(updated);
  } catch (error: any) {
    logger.error('Failed to update user profile', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    return res.status(500).json({
      error: 'Failed to update user profile',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router; 