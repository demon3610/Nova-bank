import rateLimit from 'express-rate-limit';
import { config } from '@/config';
import { getRedisClient } from '@/config/redis';
import RedisStore from 'connect-redis';
import { Request } from 'express';

function getRedisStore(): any {
  const client = getRedisClient();
  return new (RedisStore as any)({ client });
}

export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    data: null,
    errors: ['RATE_LIMIT_EXCEEDED'],
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    data: null,
    errors: ['AUTH_RATE_LIMIT_EXCEEDED'],
  },
});

export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many sensitive operations, please try again later',
    data: null,
    errors: ['SENSITIVE_RATE_LIMIT_EXCEEDED'],
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  },
});

export function createRateLimiter(store: 'redis' | 'memory' = 'redis') {
  if (store === 'redis') {
    try {
      return rateLimit({
        store: getRedisStore(),
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        standardHeaders: true,
        legacyHeaders: false,
      });
    } catch {
      return generalLimiter;
    }
  }
  return generalLimiter;
}

export default generalLimiter;
