import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export class AuthController {
  /**
   * Register a new user
   * @route POST /auth/register
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, fullName, phoneNumber, dateOfBirth, address } = req.body;

      // Check if user already exists
      const userExists = await User.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (userExists) {
        res.status(400).json({ 
          success: false, 
          message: 'User with this email or username already exists' 
        });
        return;
      }

      // Create new user
      const user = new User({
        username,
        email,
        password, // Will be hashed by the pre-save hook
        fullName,
        phoneNumber,
        dateOfBirth,
        address,
        isVerified: false
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.SECRET_KEY || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error registering user', 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Login user
   * @route POST /auth/login
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
        return;
      }

      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
        return;
      }

      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.SECRET_KEY || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error during login', 
        error: (error as Error).message 
      });
    }
  }
}

export default AuthController;
