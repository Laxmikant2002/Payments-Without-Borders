import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';

export const validateRegistration = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
  
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  check('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  check('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required'),

  // Optional fields with validation if they are provided
  check('phoneNumber')
    .optional()
    .matches(/^[0-9+\- ]+$/).withMessage('Phone number can only contain numbers, +, - and spaces'),

  check('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date'),
    
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateLogin = [
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  check('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
    
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];
