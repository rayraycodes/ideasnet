import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
      },
    });
    done(null, user || undefined);
  } catch (error) {
    done(error, undefined);
  }
});

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
        const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
        const picture = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Check if user exists by email
        let user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (user) {
          // User exists, update Google ID if not set
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: googleId,
                avatar: picture || user.avatar,
                emailVerified: true,
                isVerified: true,
              },
            });
          } else {
            // Update avatar if provided
            if (picture && picture !== user.avatar) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { avatar: picture },
              });
            }
          }
        } else {
          // Create new user
          // Generate username from email or name
          const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          let username = baseUsername;
          let counter = 1;

          // Ensure username is unique
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          user = await prisma.user.create({
            data: {
              email: email.toLowerCase(),
              username,
              firstName,
              lastName: lastName || firstName, // Use firstName as lastName if not provided
              googleId: googleId,
              avatar: picture,
              password: null, // OAuth users don't need password
              emailVerified: true,
              isVerified: true,
              role: 'ENTHUSIAST',
              skills: [],
              interests: [],
            },
          });

          logger.info(`New user created via Google OAuth: ${user?.email || 'unknown'}`);
        }

        if (!user) {
          return done(new Error('Failed to create or retrieve user'), undefined);
        }

        return done(null, user);
      } catch (error: any) {
        logger.error('Google OAuth error:', error);
        return done(error, undefined);
      }
    }
  )
  );
} else {
  logger.warn('Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required');
}

export default passport;


