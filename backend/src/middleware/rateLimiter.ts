import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

let rateLimiterInstance: RateLimiterRedis | RateLimiterMemory;

// Environment-aware rate limiting configuration
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.TESTING === 'true';
const maxRequests = isTestEnvironment ? 1000 : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
const windowMinutes = isTestEnvironment ? 1 : parseInt(process.env.RATE_LIMIT_WINDOW || '15');

try {
  // Try to use Redis rate limiter
  const redisClient = getRedisClient();
  rateLimiterInstance = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rate_limit',
    points: maxRequests,
    duration: windowMinutes * 60,
    execEvenly: true, // Spread requests evenly across the duration
  });
  logger.info(`Using Redis rate limiter: ${maxRequests} requests per ${windowMinutes} minutes`);
} catch (error) {
  // Fall back to memory rate limiter if Redis is not available
  rateLimiterInstance = new RateLimiterMemory({
    keyPrefix: 'rate_limit',
    points: maxRequests,
    duration: windowMinutes * 60,
    execEvenly: true,
  });
  logger.warn(`Redis not available, using memory rate limiter: ${maxRequests} requests per ${windowMinutes} minutes`);
}

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Skip rate limiting in test mode
  if (isTestEnvironment) {
    next();
    return;
  }

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
