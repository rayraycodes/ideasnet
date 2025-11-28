import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export const signJWT = (payload: { userId: string; role?: string }, expiresIn?: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return (jwt as any).sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const verifyJWT = (token: string): JwtPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return (jwt as any).verify(token, process.env.JWT_SECRET);
}; 