import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import passport from '../config/passport';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import ideaRoutes from './routes/ideas';
import commentRoutes from './routes/comments';
import voteRoutes from './routes/votes';
import notificationRoutes from './routes/notifications';
import messageRoutes from './routes/messages';
import aiRoutes from './routes/ai';

// Import middleware
import { errorHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

// Import database connection
import { prisma } from '../utils/database';


// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database connection test endpoint
app.get('/api/db/test', async (req, res) => {
  try {
    // Test connection without disconnecting (Prisma manages connection pool)
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const hasDbUrl = !!process.env.DATABASE_URL;
    res.status(200).json({ 
      status: 'connected',
      database: 'OK',
      hasDatabaseUrl: hasDbUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Database connection test failed', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
    res.status(500).json({ 
      status: 'disconnected',
      error: error.message,
      code: error.code,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/comments', authMiddleware, commentRoutes);
app.use('/api/votes', authMiddleware, voteRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join idea room for real-time updates
  socket.on('join-idea', (ideaId: string) => {
    socket.join(`idea-${ideaId}`);
    logger.info(`User ${socket.id} joined idea room: ${ideaId}`);
  });

  // Leave idea room
  socket.on('leave-idea', (ideaId: string) => {
    socket.leave(`idea-${ideaId}`);
    logger.info(`User ${socket.id} left idea room: ${ideaId}`);
  });

  // Handle real-time comments
  socket.on('new-comment', (data) => {
    socket.to(`idea-${data.ideaId}`).emit('comment-added', data);
  });

  // Handle real-time votes
  socket.on('new-vote', (data) => {
    socket.to(`idea-${data.ideaId}`).emit('vote-updated', data);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Ideas.net server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

export { app, io }; 