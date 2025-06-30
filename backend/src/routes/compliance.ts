import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/User';
import { KYCStatus } from '../types';
import { logger } from '../utils/logger';
const { body, validationResult } = require('express-validator');

const router = Router();

/**
 * @swagger
 * /api/compliance/kyc-status:
 *   get:
 *     summary: Get user's KYC status
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/kyc-status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await User.findById(req.user.userId).select('kycStatus amlStatus');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    logger.info('KYC status retrieved', { userId: user._id });

    res.json({
      success: true,
      message: 'KYC status retrieved successfully',
      data: {
        kycStatus: user.kycStatus,
        amlStatus: user.amlStatus,
        canTransact: user.kycStatus === KYCStatus.APPROVED && user.amlStatus === 'clear'
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve KYC status', { 
      error: error.message, 
      userId: req.user?.userId 
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/compliance/kyc-submit:
 *   post:
 *     summary: Submit KYC documents
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - documentNumber
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [passport, national_id, driving_license]
 *               documentNumber:
 *                 type: string
 *               documentUrl:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC documents submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/kyc-submit',
  authenticateToken,
  [
    body('documentType').isIn(['passport', 'national_id', 'driving_license']).withMessage('Invalid document type'),
    body('documentNumber').notEmpty().withMessage('Document number is required'),
    body('documentUrl').optional().isURL().withMessage('Invalid document URL'),
    body('address').optional().isString()
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { documentType, documentNumber } = req.body;

      // In a real implementation, you would:
      // 1. Store document information securely
      // 2. Send documents to KYC provider
      // 3. Update KYC status based on verification result

      // For now, we'll simulate the KYC submission
      const user = await User.findById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Simulate KYC processing
      if (process.env.MOCK_EXTERNAL_SERVICES === 'true') {
        // In mock mode, automatically approve KYC after 5 seconds
        setTimeout(async () => {
          try {
            await User.findByIdAndUpdate(req.user?.userId, { 
              kycStatus: KYCStatus.APPROVED,
              updatedAt: new Date()
            });
            logger.info('Mock KYC verification completed', { userId: req.user?.userId });
          } catch (error) {
            logger.error('Mock KYC update failed', { error });
          }
        }, 5000);

        user.kycStatus = KYCStatus.IN_PROGRESS;
      } else {
        user.kycStatus = KYCStatus.IN_PROGRESS;
        // Here you would integrate with actual KYC provider
      }

      await user.save();

      logger.info('KYC documents submitted', { 
        userId: user._id, 
        documentType,
        documentNumber: documentNumber.substring(0, 4) + '****' // Log only first 4 chars for security
      });

      res.json({
        success: true,
        message: 'KYC documents submitted successfully',
        data: {
          kycStatus: user.kycStatus,
          submittedAt: new Date(),
          documentType,
          estimatedReviewTime: '1-3 business days'
        }
      });

    } catch (error: any) {
      logger.error('KYC submission failed', { 
        error: error.message, 
        userId: req.user?.userId 
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/compliance/aml-check:
 *   post:
 *     summary: Perform AML screening
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionAmount
 *               - recipientCountry
 *             properties:
 *               transactionAmount:
 *                 type: number
 *               recipientCountry:
 *                 type: string
 *               recipientName:
 *                 type: string
 *     responses:
 *       200:
 *         description: AML screening completed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/aml-check',
  authenticateToken,
  [
    body('transactionAmount').isNumeric().isFloat({ min: 0.01 }).withMessage('Valid transaction amount is required'),
    body('recipientCountry').isLength({ min: 2, max: 3 }).withMessage('Valid recipient country is required'),
    body('recipientName').optional().isString()
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { transactionAmount, recipientCountry } = req.body;

      // Simulate AML screening
      let riskScore = 'low';
      let requiresApproval = false;

      // Simple risk assessment logic
      if (transactionAmount > 10000) {
        riskScore = 'high';
        requiresApproval = true;
      } else if (transactionAmount > 1000) {
        riskScore = 'medium';
      }

      // Check for high-risk countries (this would be more sophisticated in production)
      const highRiskCountries = ['AF', 'IR', 'KP', 'SY'];
      if (highRiskCountries.includes(recipientCountry.toUpperCase())) {
        riskScore = 'high';
        requiresApproval = true;
      }

      logger.info('AML screening performed', { 
        userId: req.user.userId, 
        transactionAmount,
        recipientCountry,
        riskScore,
        requiresApproval
      });

      res.json({
        success: true,
        message: 'AML screening completed',
        data: {
          riskScore,
          requiresApproval,
          canProceed: !requiresApproval,
          screeningId: `aml_${Date.now()}_${req.user.userId}`,
          recommendations: requiresApproval ? 
            ['Transaction requires manual approval', 'Additional documentation may be required'] :
            ['Transaction can proceed automatically']
        }
      });

    } catch (error: any) {
      logger.error('AML screening failed', { 
        error: error.message, 
        userId: req.user?.userId 
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/compliance/sanctions-check:
 *   post:
 *     summary: Check against sanctions lists
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sanctions check completed
 */
router.post('/sanctions-check',
  authenticateToken,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('dateOfBirth').optional().isISO8601(),
    body('country').optional().isString()
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { name, country } = req.body;

      // Simulate sanctions list checking
      // In production, this would check against actual sanctions databases
      const isOnSanctionsList = false; // Mock result
      const matchScore = 0; // Mock score (0-100)

      logger.info('Sanctions check performed', { 
        userId: req.user.userId, 
        name: name.substring(0, 3) + '***', // Partial logging for privacy
        country,
        isOnSanctionsList
      });

      res.json({
        success: true,
        message: 'Sanctions check completed',
        data: {
          isOnSanctionsList,
          matchScore,
          checkId: `sanctions_${Date.now()}_${req.user.userId}`,
          status: isOnSanctionsList ? 'blocked' : 'clear',
          checkedAt: new Date()
        }
      });

    } catch (error: any) {
      logger.error('Sanctions check failed', { 
        error: error.message, 
        userId: req.user?.userId 
      });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

export default router;
