import { Router } from 'express';
import { Request, Response } from 'express';
import { authMiddleware } from '../middleware';

const router = Router();

// Get user profile
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    // User is already attached to request by auth middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile', 
      error: (error as Error).message 
    });
  }
});

export default router;
