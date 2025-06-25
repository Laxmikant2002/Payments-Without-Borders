import { Router } from 'express';
import { SecurityController } from '../controllers/security.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const securityController = new SecurityController();

// Email verification endpoints
router.post('/verify-email/send', authMiddleware, securityController.sendVerificationEmail);
router.post('/verify-email/confirm', securityController.confirmEmailVerification);

// Two-factor authentication endpoints
router.post('/2fa/setup', authMiddleware, securityController.setupTwoFactorAuth);
router.post('/2fa/verify', authMiddleware, securityController.verifyTwoFactorAuth);

// Token refresh endpoint
router.post('/refresh-token', authMiddleware, securityController.refreshToken);

export default router;
