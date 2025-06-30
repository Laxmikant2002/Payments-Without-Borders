import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

let rateLimiterInstance: RateLimiterRedis | RateLimiterMemory;

try {
  // Try to use Redis rate limiter
  const redisClient = getRedisClient();
  rateLimiterInstance = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rate_limit',
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    duration: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60,
  });
  logger.info('Using Redis rate limiter');
} catch (error) {
  // Fall back to memory rate limiter if Redis is not available
  rateLimiterInstance = new RateLimiterMemory({
    keyPrefix: 'rate_limit',
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    duration: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60,
  });
  logger.warn('Redis not available, using memory rate limiter for development');
}

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    await rateLimiterInstance.consume(key);
    next();
  } catch (rejRes: any) {
    const remainingPoints = rejRes?.remainingPoints || 0;
    const msBeforeNext = rejRes?.msBeforeNext || 0;

    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      remainingPoints,
      msBeforeNext,
      userAgent: req.get('User-Agent')
    });

    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: Math.round(msBeforeNext / 1000) || 1,
      remainingPoints
    });
  }
};
