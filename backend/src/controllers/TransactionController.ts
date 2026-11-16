import { Response, NextFunction } from 'express';
import { RequestWithUser } from '@/types';
import TransactionService from '@/services/TransactionService';
import { success } from '@/utils/apiResponse';

export class TransactionController {
  async createTransfer(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fromAccount, toAccount, amount, description } = req.body;
      const transaction = await TransactionService.createTransfer({
        fromAccount, toAccount, amount, description, userId: req.user!.userId,
      }, req);
      success(res, transaction, 'Transfer successful', 201);
    } catch (err) {
      next(err);
    }
  }

  async getTransactions(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactions = await TransactionService.getTransactions(req.user!.userId);
      success(res, transactions);
    } catch (err) {
      next(err);
    }
  }

  async getTransaction(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.getTransactionById(id, req.user!.userId);
      success(res, transaction);
    } catch (err) {
      next(err);
    }
  }

  async scheduleTransfer(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fromAccount, toAccount, amount, scheduledDate, description, isRecurring, recurringPattern } = req.body;
      const transaction = await TransactionService.scheduleTransfer({
        fromAccount, toAccount, amount, scheduledDate, description, isRecurring, recurringPattern, userId: req.user!.userId,
      }, req);
      success(res, transaction, 'Transfer scheduled', 201);
    } catch (err) {
      next(err);
    }
  }

  async cancelScheduled(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.cancelScheduledTransfer(id, req.user!.userId, req);
      success(res, transaction, 'Scheduled transfer cancelled');
    } catch (err) {
      next(err);
    }
  }

  async getPending(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactions = await TransactionService.getPendingTransfers(req.user!.userId);
      success(res, transactions);
    } catch (err) {
      next(err);
    }
  }

  async getScheduled(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactions = await TransactionService.getScheduledTransfers(req.user!.userId);
      success(res, transactions);
    } catch (err) {
      next(err);
    }
  }
}

export default new TransactionController();
