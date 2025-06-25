import { Request, Response } from 'express';
import User from '../models/user.model';
import { emailTokens, twoFactorAuth } from '../middleware/security.middleware';
import { sendEmail } from '../services/email.service';
import jwt from 'jsonwebtoken';

export class SecurityController {
  /**
   * Send email verification link
   * @route POST /auth/verify-email/send
   */
  public async sendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Generate verification token
      const verificationToken = emailTokens.generate(user._id.toString(), user.email);

      // Save verification token to user
      user.emailVerificationToken = verificationToken;
      await user.save();

      // Create verification link
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

      // Send email with verification link
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
          <h1>Email Verification</h1>
          <p>Hello ${user.fullName || user.username},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <p>
            <a href="${verificationLink}">Verify Email</a>
          </p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      res.status(200).json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error) {
      console.error('Send verification email error:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending verification email',
        error: (error as Error).message
      });
    }
  }

  /**
   * Confirm email verification
   * @route POST /auth/verify-email/confirm
   */
  public async confirmEmailVerification(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      // Verify token
      const decoded = emailTokens.verify(token);
      if (!decoded || decoded.purpose !== 'email_verification') {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
        return;
      }

      // Find user by id from token
      const user = await User.findOne({ 
        _id: decoded.userId,
        emailVerificationToken: token 
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found or token already used'
        });
        return;
      }

      // Update user to verified
      user.isVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Email successfully verified'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying email',
        error: (error as Error).message
      });
    }
  }

  /**
   * Setup two-factor authentication
   * @route POST /auth/2fa/setup
   */
  public async setupTwoFactorAuth(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - user is added by auth middleware
      const user = req.user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      // Generate 2FA secret
      const { secret, qrCodeUrl } = await twoFactorAuth.generateSecret(user.username);

      // Save temporary secret to user
      user.tempTwoFactorSecret = secret;
      await user.save();

      res.status(200).json({
        success: true,
        secret,
        qrCodeUrl
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Error setting up two-factor authentication',
        error: (error as Error).message
      });
    }
  }

  /**
   * Verify and enable two-factor authentication
   * @route POST /auth/2fa/verify
   */
  public async verifyTwoFactorAuth(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      
      // @ts-ignore - user is added by auth middleware
      const user = req.user;
      
      if (!user || !user.tempTwoFactorSecret) {
        res.status(400).json({
          success: false,
          message: 'No two-factor setup found'
        });
        return;
      }

      // Verify the code against the secret
      const isValid = twoFactorAuth.verify(user.tempTwoFactorSecret, code);

      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
        return;
      }

      // Enable 2FA for the user
      user.twoFactorSecret = user.tempTwoFactorSecret;
      user.twoFactorEnabled = true;
      user.tempTwoFactorSecret = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Two-factor authentication enabled'
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying two-factor authentication',
        error: (error as Error).message
      });
    }
  }

  /**
   * Refresh access token
   * @route POST /auth/refresh-token
   */
  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - user is added by auth middleware
      const user = req.user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      // Generate a new token
      const token = jwt.sign(
        { id: user._id },
        process.env.SECRET_KEY || 'fallback_secret',
        { expiresIn: '15m' }
      );

      res.status(200).json({
        success: true,
        data: {
          token,
          expiresIn: 15 * 60, // 15 minutes in seconds
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Error refreshing token',
        error: (error as Error).message
      });
    }
  }
}
