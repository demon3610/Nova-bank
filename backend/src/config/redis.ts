import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

let redisClient: Redis;
let redisSubscriber: Redis;
let redisPublisher: Redis;

export function connectRedis(): void {
  redisClient = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisSubscriber = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisPublisher = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis client error:', err);
  });

  redisSubscriber.on('connect', () => {
    logger.info('Redis subscriber connected');
  });

  redisSubscriber.on('error', (err) => {
    logger.error('Redis subscriber error:', err);
  });

  redisPublisher.on('connect', () => {
    logger.info('Redis publisher connected');
  });

  redisPublisher.on('error', (err) => {
    logger.error('Redis publisher error:', err);
  });
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export function getRedisSubscriber(): Redis {
  if (!redisSubscriber) {
    throw new Error('Redis subscriber not initialized. Call connectRedis() first.');
  }
  return redisSubscriber;
}

export function getRedisPublisher(): Redis {
  if (!redisPublisher) {
    throw new Error('Redis publisher not initialized. Call connectRedis() first.');
  }
  return redisPublisher;
}

export async function closeRedis(): Promise<void> {
  await Promise.all([
    redisClient?.quit(),
    redisSubscriber?.quit(),
    redisPublisher?.quit(),
  ]);
  logger.info('Redis connections closed');
}
