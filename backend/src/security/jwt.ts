import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { JwtPayload } from '@/types';

export function generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

export function generateTokenPair(payload: Omit<JwtPayload, 'type'>): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
