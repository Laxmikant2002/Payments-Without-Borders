import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const walletController = new WalletController();

// Apply auth middleware to all wallet routes
router.use(authMiddleware);

// Wallet management routes
router.post('/', walletController.createWallet);
router.get('/', walletController.getWallets);
router.get('/transactions/recent', walletController.getRecentTransactions);
router.get('/summary', walletController.getWalletSummary);
router.get('/:id', walletController.getWalletById);
router.post('/:id/deposit', walletController.depositFunds);

export default router;
