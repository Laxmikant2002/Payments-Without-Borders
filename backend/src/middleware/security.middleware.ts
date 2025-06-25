import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Email verification middleware
 */
export const requireEmailVerified = (req: Request, res: Response, next: NextFunction): void => {
  // @ts-ignore - user is added by auth middleware
  const user = req.user;
  
  if (!user) {
    res.status(401).json({ 
      success: false, 
      message: 'Unauthorized access' 
    });
    return;
  }
  
  if (!user.isVerified) {
    res.status(403).json({ 
      success: false, 
      message: 'Email verification required. Please verify your email to access this resource.' 
    });
    return;
  }
  
  next();
};

/**
 * Two-factor authentication middleware
 */
export const require2FA = (req: Request, res: Response, next: NextFunction): void => {
  // @ts-ignore - user is added by auth middleware
  const user = req.user;
  
  if (!user) {
    res.status(401).json({ 
      success: false, 
      message: 'Unauthorized access' 
    });
    return;
  }
  
  if (user.twoFactorEnabled && !req.session?.verified2FA) {
    res.status(403).json({ 
      success: false, 
      message: 'Two-factor authentication required',
      requiresSecondFactor: true
    });
    return;
  }
  
  next();
};

/**
 * Generate and verify email tokens
 */
export const emailTokens = {
  generate: (userId: string, email: string): string => {
    return jwt.sign(
      { userId, email, purpose: 'email_verification' },
      process.env.SECRET_KEY || 'fallback_secret',
      { expiresIn: '24h' }
    );
  },
  
  verify: (token: string): any => {
    try {
      return jwt.verify(token, process.env.SECRET_KEY || 'fallback_secret');
    } catch (error) {
      return null;
    }
  }
};

/**
 * Two-factor authentication helpers
 */
export const twoFactorAuth = {
  generateSecret: async (username: string): Promise<{ secret: string, qrCodeUrl: string }> => {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `PayHack:${username}`
    });
    
    const url = await QRCode.toDataURL(secret.otpauth_url || '');
    
    return {
      secret: secret.base32,
      qrCodeUrl: url
    };
  },
  
  verify: (secret: string, token: string): boolean => {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 period before/after for clock drift
    });
  }
};
