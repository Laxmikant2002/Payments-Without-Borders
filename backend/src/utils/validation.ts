import { Request, Response } from 'express';
const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Returns true if validation passed, false if there were errors (response already sent)
 */
export const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return false;
  }
  return true;
};

/**
 * Check if user is authenticated
 * Returns true if authenticated, false if not (response already sent)
 */
export const checkAuthentication = (req: Request, res: Response): boolean => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return false;
  }
  return true;
};

/**
 * Combined validation and authentication check
 */
export const validateAndAuthenticate = (req: Request, res: Response): boolean => {
  return handleValidationErrors(req, res) && checkAuthentication(req, res);
};
