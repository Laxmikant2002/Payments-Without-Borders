import { Request, Response } from 'express';
import AuthController from './auth.controller';
import { WalletController } from './wallet.controller';

export class IndexController {
    public getIndex(req: Request, res: Response): void {
        res.send('Welcome to the Payment API!');
    }

    public createItem(req: Request, res: Response): void {
        // Logic to create an item
        res.send('Item created!');
    }
}

export { AuthController, WalletController };