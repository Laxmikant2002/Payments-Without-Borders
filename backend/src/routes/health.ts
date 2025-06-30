import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: connected
 *                     redis:
 *                       type: string
 *                       example: connected
 */
router.get('/', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'connected', // TODO: Add actual database health check
      redis: 'connected',     // TODO: Add actual Redis health check
      mojaloop: 'connected'   // TODO: Add actual Mojaloop health check
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  logger.info('Health check requested', { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });

  res.status(200).json(healthCheck);
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check with service dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health status
 */
router.get('/detailed', async (req, res) => {
  // TODO: Implement detailed health checks for all services
  const detailedHealth = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: { status: 'healthy', latency: 0 },
      database: { status: 'healthy', latency: 0 },
      redis: { status: 'healthy', latency: 0 },
      mojaloop: { status: 'healthy', latency: 0 }
    }
  };

  res.status(200).json(detailedHealth);
});

export default router;
