import { Request, Response } from 'express';
import Wallet from '../models/wallet.model';
import Transaction, { TransactionType, TransactionStatus } from '../models/transaction.model';

export class WalletController {
  /**
   * Create a new wallet for a user
   * @route POST /wallet
   */
  public async createWallet(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - user is added by auth middleware
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      // Check if user already has a wallet with the requested currency
      const { currency = 'USD' } = req.body;

      const existingWallet = await Wallet.findOne({
        user: user._id,
        currency
      });

      if (existingWallet) {
        res.status(400).json({
          success: false,
          message: `You already have a ${currency} wallet`
        });
        return;
      }

      // Create a new wallet
      const wallet = new Wallet({
        user: user._id,
        currency,
        // walletAddress will be auto-generated in the pre-save hook
      });

      await wallet.save();

      res.status(201).json({
        success: true,
        message: 'Wallet created successfully',
        data: {
          wallet: {
            id: wallet._id,
            balance: wallet.balance,
            currency: wallet.currency,
            walletAddress: wallet.walletAddress,
            createdAt: wallet.createdAt
          }
        }
      });
    } catch (error) {
      console.error('Create wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating wallet',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get user's wallets
   * @route GET /wallet
   */
  public async getWallets(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - user is added by auth middleware
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      // Get all wallets for the user
      const wallets = await Wallet.find({ user: user._id });

      res.status(200).json({
        success: true,
        data: {
          wallets: wallets.map(wallet => ({
            id: wallet._id,
            balance: wallet.balance,
            currency: wallet.currency,
            walletAddress: wallet.walletAddress,
            isActive: wallet.isActive,
            createdAt: wallet.createdAt
          }))
        }
      });
    } catch (error) {
      console.error('Get wallets error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving wallets',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get a specific wallet by ID
   * @route GET /wallet/:id
   */
  public async getWalletById(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - user is added by auth middleware
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const walletId = req.params.id;

      // Find the wallet and ensure it belongs to the user
      const wallet = await Wallet.findOne({
        _id: walletId,
        user: user._id
      });

      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
        return;
      }

      // Get recent transactions for this wallet
      const recentTransactions = await Transaction.find({
        $or: [
          { sourceWallet: wallet._id },
          { destinationWallet: wallet._id }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(5);

      res.status(200).json({
        success: true,
        data: {
          wallet: {
            id: wallet._id,
            balance: wallet.balance,
            currency: wallet.currency,
            walletAddress: wallet.walletAddress,
            isActive: wallet.isActive,
            createdAt: wallet.createdAt
          },
          recentTransactions: recentTransactions.map(txn => ({
            id: txn._id,
            amount: txn.amount,
            currency: txn.currency,
            type: txn.type,
            status: txn.status,
            description: txn.description,
            createdAt: txn.createdAt,
            reference: txn.reference
          }))
        }
      });
    } catch (error) {
      console.error('Get wallet by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving wallet',
        error: (error as Error).message
      });
    }
  }

  /**
   * Add funds to wallet (deposit)
   * @route POST /wallet/:id/deposit
   */
  public async depositFunds(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - user is added by auth middleware
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const walletId = req.params.id;
      const { amount, description = 'Deposit' } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
        return;
      }

      // Find the wallet and ensure it belongs to the user
      const wallet = await Wallet.findOne({
        _id: walletId,
        user: user._id
      });

      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
        return;
      }

      if (!wallet.isActive) {
        res.status(400).json({
          success: false,
          message: 'This wallet is inactive'
        });
        return;
      }

      // Create a transaction record
      const transaction = new Transaction({
        sender: user._id,
        recipient: user._id, // self for deposits
        sourceWallet: wallet._id,
        destinationWallet: wallet._id, // same wallet for deposits
        amount: amount,
        currency: wallet.currency,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description
      });

      await transaction.save();

      // Update wallet balance
      wallet.balance += Number(amount);
      await wallet.save();

      res.status(200).json({
        success: true,
        message: 'Funds deposited successfully',
        data: {
          transaction: {
            id: transaction._id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            reference: transaction.reference
          },
          newBalance: wallet.balance
        }
      });
    } catch (error) {
      console.error('Deposit funds error:', error);
      res.status(500).json({
        success: false,
        message: 'Error depositing funds',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get recent transactions for user across all wallets
   * @route GET /wallet/transactions/recent
   */
  public async getRecentTransactions(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - user is added by auth middleware
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 5;

      // Get all wallets for the user to filter transactions
      const wallets = await Wallet.find({ user: user._id });
      const walletIds = wallets.map(wallet => wallet._id);

      // Find transactions where the user's wallets are either source or destination
      const transactions = await Transaction.find({
        $or: [
          { sourceWallet: { $in: walletIds } },
          { destinationWallet: { $in: walletIds } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit);

      res.status(200).json({
        success: true,
        data: {
          recentTransactions: transactions.map(txn => ({
            id: txn._id,
            amount: txn.amount,
            currency: txn.currency,
            type: txn.type,
            status: txn.status,
            description: txn.description,
            createdAt: txn.createdAt,
            reference: txn.reference
          }))
        }
      });
    } catch (error) {
      console.error('Get recent transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving recent transactions',
        error: (error as Error).message
      });
    }
  }

  /**
   * Get wallet summary with total balance across all currencies
   * @route GET /wallet/summary
   */
  public async getWalletSummary(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - user is added by auth middleware
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      // Get all wallets for the user
      const wallets = await Wallet.find({ user: user._id });

      // Calculate totals by currency
      const totalByCurrency: Record<string, number> = {};
      let totalInUSD = 0;

      wallets.forEach(wallet => {
        if (!totalByCurrency[wallet.currency]) {
          totalByCurrency[wallet.currency] = 0;
        }
        totalByCurrency[wallet.currency] += wallet.balance;
        
        // Note: In a real application, we would use exchange rates to convert to USD
        // For simplicity, we're just adding them up directly
        totalInUSD += wallet.balance;
      });

      const walletCount = wallets.length;
      const activeWallets = wallets.filter(w => w.isActive).length;

      res.status(200).json({
        success: true,
        data: {
          summary: {
            totalByCurrency,
            totalBalance: totalInUSD,
            walletCount,
            activeWallets
          }
        }
      });
    } catch (error) {
      console.error('Get wallet summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving wallet summary',
        error: (error as Error).message
      });
    }
  }
}
