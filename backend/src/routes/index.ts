import { Router, Application } from 'express';
import { IndexController } from '../controllers/index';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import securityRoutes from './security.routes';
import walletRoutes from './wallet.routes';

const router = Router();
const indexController = new IndexController();

export function setRoutes(app: Application) {
    // Base routes
    app.use('/', router);
    router.get('/', indexController.getIndex.bind(indexController));
    router.post('/items', indexController.createItem.bind(indexController));
    
    // Auth routes
    app.use('/auth', authRoutes);
    
    // User routes
    app.use('/users', userRoutes);

    // Register security routes
    router.use('/auth', securityRoutes);
    
    // Wallet routes
    app.use('/wallet', walletRoutes);
}