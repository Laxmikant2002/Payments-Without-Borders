import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { KYCStatus } from '../types';

const router = Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    logger.info('User profile retrieved', { userId: user._id });

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          country: user.country,
          currency: user.currency,
          kycStatus: user.kycStatus,
          amlStatus: user.amlStatus,
          isActive: user.isActive,
          dateOfBirth: user.dateOfBirth,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve user profile', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               country:
 *                 type: string
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { firstName, lastName, phoneNumber, dateOfBirth, country, currency } = req.body;

    // Validate phone number if provided
    if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
      return;
    }

    // Validate date of birth if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      
      if (age < 18 || age > 120) {
        res.status(400).json({
          success: false,
          message: 'Age must be between 18 and 120 years'
        });
        return;
      }
    }

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (country) updateData.country = country.trim();
    if (currency) updateData.currency = currency.toUpperCase();

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    logger.info('User profile updated', { userId: user._id, updatedFields: Object.keys(updateData) });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          country: user.country,
          currency: user.currency,
          kycStatus: user.kycStatus,
          amlStatus: user.amlStatus,
          isActive: user.isActive,
          dateOfBirth: user.dateOfBirth,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to update user profile', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/kyc-upload:
 *   post:
 *     summary: Submit KYC documents
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [passport, driving_license, national_id, utility_bill]
 *               documentNumber:
 *                 type: string
 *               documentUrl:
 *                 type: string
 *               additionalInfo:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC documents submitted successfully
 *       400:
 *         description: Invalid document data
 *       401:
 *         description: Unauthorized
 */
router.post('/kyc-upload', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { documentType, documentNumber, documentUrl, additionalInfo } = req.body;

    if (!documentType || !documentNumber) {
      res.status(400).json({
        success: false,
        message: 'Document type and number are required'
      });
      return;
    }

    const validDocumentTypes = ['passport', 'driving_license', 'national_id', 'utility_bill'];
    if (!validDocumentTypes.includes(documentType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
      return;
    }

    // Update user's KYC status to in_progress
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        kycStatus: KYCStatus.IN_PROGRESS,
        kycDocuments: {
          type: documentType,
          number: documentNumber,
          url: documentUrl || '',
          additionalInfo: additionalInfo || '',
          submittedAt: new Date()
        }
      },
      { new: true, select: '-password' }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    logger.info('KYC documents submitted', { 
      userId: user._id, 
      documentType,
      hasUrl: !!documentUrl 
    });

    res.json({
      success: true,
      message: 'KYC documents submitted successfully. Your application is now under review.',
      data: {
        kycStatus: user.kycStatus,
        submittedAt: new Date()
      }
    });

  } catch (error: any) {
    logger.error('Failed to submit KYC documents', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password data
 *       401:
 *         description: Unauthorized or incorrect current password
 */
router.put('/change-password', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
      return;
    }

    // Get user with password
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await User.findByIdAndUpdate(req.user.userId, {
      password: hashedNewPassword
    });

    logger.info('User password changed', { userId: user._id });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error: any) {
    logger.error('Failed to change password', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/deactivate:
 *   put:
 *     summary: Deactivate user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - reason
 *             properties:
 *               password:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       401:
 *         description: Unauthorized or incorrect password
 */
router.put('/deactivate', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { password, reason } = req.body;

    if (!password || !reason) {
      res.status(400).json({
        success: false,
        message: 'Password and reason are required'
      });
      return;
    }

    // Get user with password
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
      return;
    }

    // Deactivate account
    await User.findByIdAndUpdate(req.user.userId, {
      isActive: false,
      deactivatedAt: new Date(),
      deactivationReason: reason
    });

    logger.info('User account deactivated', { userId: user._id, reason });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error: any) {
    logger.error('Failed to deactivate account', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 */
router.get('/preferences', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await User.findById(req.user.userId).select('preferences currency');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Preferences retrieved successfully',
      data: {
        preferences: {
          currency: user.currency,
          notifications: user.preferences?.notifications || {
            email: true,
            sms: false,
            push: true
          },
          language: user.preferences?.language || 'en',
          timezone: user.preferences?.timezone || 'UTC',
          twoFactorAuth: user.preferences?.twoFactorAuth || false
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve preferences', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   sms:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *               language:
 *                 type: string
 *               timezone:
 *                 type: string
 *               twoFactorAuth:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/preferences', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { notifications, language, timezone, twoFactorAuth } = req.body;

    const updateData: any = {};
    if (notifications) updateData['preferences.notifications'] = notifications;
    if (language) updateData['preferences.language'] = language;
    if (timezone) updateData['preferences.timezone'] = timezone;
    if (typeof twoFactorAuth === 'boolean') updateData['preferences.twoFactorAuth'] = twoFactorAuth;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, select: 'preferences currency' }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    logger.info('User preferences updated', { userId: req.user.userId });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error: any) {
    logger.error('Failed to update preferences', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/address:
 *   post:
 *     summary: Add user address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - state
 *               - postalCode
 *               - country
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address added successfully
 */
router.post('/address', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { street, city, state, postalCode, country, isPrimary } = req.body;

    if (!street || !city || !state || !postalCode || !country) {
      res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const newAddress = {
      id: new Date().getTime().toString(),
      street,
      city,
      state,
      postalCode,
      country,
      isPrimary: isPrimary || false,
      createdAt: new Date()
    };

    // If this is set as primary, make other addresses non-primary
    if (isPrimary && user.addresses) {
      user.addresses.forEach((addr: any) => {
        addr.isPrimary = false;
      });
    }

    if (!user.addresses) {
      user.addresses = [];
    }
    user.addresses.push(newAddress);
    
    await user.save();

    logger.info('User address added', { userId: user._id, addressId: newAddress.id });

    res.json({
      success: true,
      message: 'Address added successfully',
      data: {
        address: newAddress
      }
    });

  } catch (error: any) {
    logger.error('Failed to add address', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/addresses:
 *   get:
 *     summary: Get user addresses
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 */
router.get('/addresses', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await User.findById(req.user.userId).select('addresses');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Addresses retrieved successfully',
      data: {
        addresses: user.addresses || []
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve addresses', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/security-settings:
 *   get:
 *     summary: Get user security settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security settings retrieved successfully
 */
router.get('/security-settings', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await User.findById(req.user.userId).select('lastLogin createdAt preferences');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Security settings retrieved successfully',
      data: {
        securitySettings: {
          lastLogin: user.lastLogin,
          accountCreated: user.createdAt,
          twoFactorAuth: user.preferences?.twoFactorAuth || false,
          sessionTimeout: '24h',
          loginAttempts: 0, // Mock data
          accountLocked: false
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve security settings', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/profile-picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 */
router.post('/profile-picture', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
      return;
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      res.status(400).json({
        success: false,
        message: 'Invalid image URL format'
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: imageUrl },
      { new: true, select: 'profilePicture' }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    logger.info('Profile picture updated', { userId: req.user.userId });

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: user.profilePicture
      }
    });

  } catch (error: any) {
    logger.error('Failed to upload profile picture', { error: error.message, userId: req.user?.userId });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'User endpoints placeholder' });
});

export default router;
