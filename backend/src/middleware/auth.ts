import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        country: string;
        currency: string;
        kycStatus: string;
        amlStatus: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  country: string;
  currency: string;
  kycStatus: string;
  amlStatus: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not configured');
      res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;

    logger.debug('Token authenticated successfully', { 
      userId: decoded.userId,
      email: decoded.email 
    });

    next();
  } catch (error: any) {
    logger.warn('Token authentication failed', { 
      error: error.message,
      token: token.substring(0, 20) + '...' 
    });

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Token authentication failed'
    });
  }
};

/**
 * Middleware to check if user has completed KYC verification
 */
export const requireKYC = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.kycStatus !== 'VERIFIED') {
    res.status(403).json({
      success: false,
      message: 'KYC verification required for this action',
      code: 'KYC_REQUIRED',
      data: {
        kycStatus: req.user.kycStatus,
        requiredStatus: 'VERIFIED'
      }
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user has passed AML screening
 */
export const requireAML = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.amlStatus !== 'CLEAR') {
    res.status(403).json({
      success: false,
      message: 'AML clearance required for this action',
      code: 'AML_REQUIRED',
      data: {
        amlStatus: req.user.amlStatus,
        requiredStatus: 'CLEAR'
      }
    });
    return;
  }

  next();
};

/**
 * Middleware to check both KYC and AML status for high-value transactions
 */
export const requireCompliance = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const issues: string[] = [];

  if (req.user.kycStatus !== 'VERIFIED') {
    issues.push('KYC verification required');
  }

  if (req.user.amlStatus !== 'CLEAR') {
    issues.push('AML clearance required');
  }

  if (issues.length > 0) {
    res.status(403).json({
      success: false,
      message: 'Compliance verification required',
      code: 'COMPLIANCE_REQUIRED',
      data: {
        issues,
        kycStatus: req.user.kycStatus,
        amlStatus: req.user.amlStatus
      }
    });
    return;
  }

  next();
};

/**
 * Optional authentication middleware - sets user if token is valid, but doesn't fail if missing
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;

    logger.debug('Optional auth: Token authenticated', { userId: decoded.userId });
  } catch (error: any) {
    logger.debug('Optional auth: Token authentication failed', { error: error.message });
    // Don't fail, just continue without user
  }

  next();
};
