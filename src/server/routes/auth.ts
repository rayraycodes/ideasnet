import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { prisma } from '../../utils/database';
import { createError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { JwtPayload } from '../../types';
import { signJWT, verifyJWT } from '../../utils/jwt';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, firstName, lastName, password, role } = req.body;

    // Validate required fields with specific messages
    const missingFields: string[] = [];
    if (!email || !email.trim()) missingFields.push('email');
    if (!username || !username.trim()) missingFields.push('username');
    if (!firstName || !firstName.trim()) missingFields.push('first name');
    if (!lastName || !lastName.trim()) missingFields.push('last name');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: `Please provide: ${missingFields.join(', ')}`,
        fields: missingFields
      });
    }

    // Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please enter a valid email address (e.g., name@example.com). Make sure it contains @ and a domain.'
      });
    }
    
    // Additional email validation
    if (trimmedEmail.includes('..')) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Email cannot contain consecutive dots (..)'
      });
    }
    
    if (trimmedEmail.startsWith('.') || trimmedEmail.startsWith('@')) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Email cannot start with a dot or @ symbol'
      });
    }
    
    if (trimmedEmail.endsWith('.') || trimmedEmail.endsWith('@')) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Email cannot end with a dot or @ symbol'
      });
    }
    
    // Check for valid domain
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2 || !parts[1].includes('.')) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Email must have a valid domain (e.g., @gmail.com, @example.com)'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'Password must be at least 6 characters long'
      });
    }
    if (password.length > 100) {
      return res.status(400).json({
        error: 'Password too long',
        message: 'Password must be 100 characters or less'
      });
    }

    // Validate username format
    if (username.length < 3) {
      return res.status(400).json({
        error: 'Username too short',
        message: 'Username must be at least 3 characters long'
      });
    }
    if (username.length > 20) {
      return res.status(400).json({
        error: 'Username too long',
        message: 'Username must be 20 characters or less'
      });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        error: 'Invalid username format',
        message: 'Username can only contain letters, numbers, and underscores (no spaces or special characters)'
      });
    }

    // Validate name fields
    if (firstName.trim().length < 2) {
      return res.status(400).json({
        error: 'First name too short',
        message: 'First name must be at least 2 characters long'
      });
    }
    if (lastName.trim().length < 2) {
      return res.status(400).json({
        error: 'Last name too short',
        message: 'Last name must be at least 2 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: trimmedEmail },
          { username: username.trim().toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email.toLowerCase() === trimmedEmail ? 'email' : 'username';
      const fieldValue = field === 'email' ? trimmedEmail : username.trim().toLowerCase();
      return res.status(400).json({
        error: 'User already exists',
        message: `An account with this ${field} (${fieldValue}) already exists. Please use a different ${field} or try logging in instead.`
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check for JWT_SECRET before creating user
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'JWT_SECRET is not configured. Please contact the administrator.'
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        username: username.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: hashedPassword,
        role: role || 'ENTHUSIAST'
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true
      }
    });

    // Generate JWT token
    let token: string;
    try {
      token = signJWT({ userId: user.id, role: user.role });
    } catch (jwtError: any) {
      logger.error('JWT signing error:', jwtError);
      // If JWT signing fails, we should still return success but log the error
      // However, this is a critical error, so we'll return an error
      return res.status(500).json({
        error: 'Token generation failed',
        message: 'User created but failed to generate authentication token. Please try logging in.'
      });
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error: any) {
    logger.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json({
        error: 'Duplicate entry',
        message: `This ${field} is already in use`
      });
    }
    
    // Handle Prisma connection errors
    if (error.code === 'P1001' || error.code === 'P1000') {
      logger.error('Database connection error:', error);
      return res.status(500).json({
        error: 'Database connection error',
        message: 'Unable to connect to the database. Please try again later.'
      });
    }
    
    // Handle Prisma validation errors
    if (error.code && error.code.startsWith('P')) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message || 'Invalid data provided'
      });
    }
    
    // Handle JWT errors
    if (error.message && error.message.includes('JWT_SECRET')) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'JWT_SECRET is not configured. Please contact the administrator.'
      });
    }
    
    return res.status(500).json({
      error: 'Registration failed',
      message: error.message || 'An error occurred during registration. Please try again.'
    });
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        password: true,
        googleId: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check if user is OAuth-only (no password)
    if (!user.password || user.password === '') {
      return res.status(401).json({
        error: 'This account was created with Google sign-in. Please use Google sign-in to access your account.'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    // Generate JWT token
    const token = signJWT({ userId: user.id, role: user.role });

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    return res.status(500).json({
      error: 'Login failed',
      message: error.message || 'An error occurred during login'
    });
  }
});

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.id) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
      }

      const token = signJWT({ userId: user.id, role: user.role });
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  }
);

// LinkedIn OAuth
router.get('/linkedin',
  passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] })
);

router.get('/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || !user.id) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
      }

      const token = signJWT({ userId: user.id, role: user.role });
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    } catch (error) {
      logger.error('LinkedIn OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  }
);

// Verify token
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyJWT(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router; 