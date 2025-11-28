import { Router, Request, Response } from 'express';
import { prisma } from '../../utils/database';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth';
import slugify from 'slugify';
import { AuthRequest } from '../../types';
import { logger } from '../../utils/logger';

const router = Router();

// Get all ideas
router.get('/', async (req: Request, res: Response) => {
  try {
    const ideas = await prisma.idea.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, firstName: true, lastName: true, avatar: true } },
        comments: {
          where: { isDeleted: false },
          select: { id: true }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
    });
    
    // Transform the data to include comment count
    const ideasWithCounts = ideas.map(idea => ({
      ...idea,
      commentCount: idea._count?.comments || idea.comments?.length || 0
    }));
    
    return res.json(ideasWithCounts);
  } catch (error: any) {
    logger.error('Failed to fetch ideas', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    
    // Check if it's a table doesn't exist error
    if (error.message?.includes('does not exist') || error.code === 'P2021') {
      return res.status(500).json({ 
        error: 'Database tables not found',
        message: 'The database tables have not been created yet. Please run the database migrations.',
        setupInstructions: [
          '1. Make sure DATABASE_URL is set in your .env file',
          '2. Run: npx prisma db push',
          '3. Or run the SQL schema in Supabase SQL Editor (see supabase-schema.sql)',
          '4. Then restart the server'
        ]
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to fetch ideas',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get idea by slug (with optional auth to allow authors to view their own non-public ideas)
router.get('/:slug', optionalAuthMiddleware as any, async (req: Request, res: Response) => {
  try {
    const idea = await prisma.idea.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: { select: { id: true, username: true, firstName: true, lastName: true, avatar: true } },
        comments: true,
      },
    });
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    // Allow author to view their own ideas even if not public
    // For other users, only show public ideas
    const authReq = req as any;
    const isAuthor = authReq.user && idea.authorId === authReq.user.id;
    
    if (!idea.isPublic && !isAuthor) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    return res.json(idea);
  } catch (error: any) {
    logger.error('Failed to fetch idea by slug', {
      error: error.message,
      stack: error.stack,
      slug: req.params.slug
    });
    return res.status(500).json({ 
      error: 'Failed to fetch idea',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new idea
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const { title, description, problem, solution, targetMarket, businessModel, tags, industry, technology, isPublic } = req.body;
    if (!title || !description || !problem || !solution) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 7);
    const idea = await prisma.idea.create({
      data: {
        title,
        slug,
        description,
        problem,
        solution,
        targetMarket,
        businessModel,
        tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
        industry,
        technology,
        isPublic: isPublic !== undefined ? isPublic : true,
        authorId: req.user!.id,
      },
    });
    return res.status(201).json(idea);
  } catch (error: any) {
    logger.error('Failed to create idea', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      userId: req.user?.id
    });
    return res.status(500).json({ 
      error: 'Failed to create idea',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update idea
router.put('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.idea.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    if (existing.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const { title, description, problem, solution, targetMarket, businessModel, tags, industry, technology, isPublic } = req.body;
    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = slugify(title, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 7);
    }
    const updated = await prisma.idea.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        problem,
        solution,
        targetMarket,
        businessModel,
        tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
        industry,
        technology,
        isPublic,
      },
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update idea' });
  }
});

// Delete idea
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.idea.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    if (existing.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.idea.delete({ where: { id } });
    return res.json({ message: 'Idea deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete idea' });
  }
});

export default router; 