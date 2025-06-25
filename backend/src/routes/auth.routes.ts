import { Router } from 'express';
import { AuthController } from '../controllers';
import { validateRegistration, validateLogin } from '../middleware';

const router = Router();
const authController = new AuthController();

// Authentication routes
router.post('/register', validateRegistration, authController.register.bind(authController));
router.post('/login', validateLogin, authController.login.bind(authController));

export default router;
