import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '@/repositories/UserRepository';
import { accountsDb, cardsDb, transactionsDb, auditLogsDb, rolesDb } from '@/database';
import { success, error } from '@/utils/apiResponse';
import { AppError } from '@/middlewares/errorHandler';
import { logAction } from '@/middlewares/audit';
import CardService from '@/services/CardService';

export class EmployeeController {
  async lookupCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.query as { query: string };
      if (!query) {
        error(res, 'Search query required', 400);
        return;
      }

      const user = UserRepository.findOne((u) =>
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.phone === query ||
        u.id === query
      );

      if (!user) {
        error(res, 'Customer not found', 404);
        return;
      }

      success(res, user);
    } catch (err) {
      next(err);
    }
  }

  async getCustomerDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = UserRepository.findById(id);
      if (!user) {
        throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
      }
      const roles = user.roles.map((roleId) => rolesDb.findById(roleId)).filter(Boolean);

      const accounts = accountsDb.findMany((a) => a.userId === id);
      const cards = cardsDb.findMany((c) => c.userId === id);

      success(res, { user: { ...user, roles }, accounts, cards });
    } catch (err) {
      next(err);
    }
  }

  async reviewKyc(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = UserRepository.findById(id);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      success(res, { user, kycDocuments: user.kycStatus });
    } catch (err) {
      next(err);
    }
  }

  async approveKyc(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = UserRepository.update(id, { kycStatus: 'verified' });
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      await logAction(req as any, {
        action: 'kyc_update',
        resource: 'User',
        resourceId: id,
        severity: 'medium',
        details: { kycStatus: 'verified' },
      } as any);

      success(res, user, 'KYC approved');
    } catch (err) {
      next(err);
    }
  }

  async rejectKyc(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user = UserRepository.update(id, { kycStatus: 'rejected' });
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      await logAction(req as any, {
        action: 'kyc_update',
        resource: 'User',
        resourceId: id,
        severity: 'medium',
        details: { kycStatus: 'rejected', reason },
      } as any);

      success(res, user, 'KYC rejected');
    } catch (err) {
      next(err);
    }
  }

  async reviewTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = transactionsDb.findById(id);
      if (!transaction) {
        throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
      }

      const fromAccount = accountsDb.findById(transaction.fromAccount);
      const toAccount = accountsDb.findById(transaction.toAccount);

      success(res, { ...transaction, fromAccount, toAccount });
    } catch (err) {
      next(err);
    }
  }

  async flagTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const txService = await import('@/services/TransactionService');
      await txService.default.flagSuspiciousTransaction(id, reason || 'Flagged by employee');

      await logAction(req as any, {
        action: 'transfer',
        resource: 'Transaction',
        resourceId: id,
        severity: 'high',
        details: { type: 'flagged_by_employee', reason },
      } as any);

      success(res, null, 'Transaction flagged');
    } catch (err) {
      next(err);
    }
  }

  async clearTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = transactionsDb.update(id, { status: 'completed' });
      if (!transaction) {
        throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
      }

      await logAction(req as any, {
        action: 'transfer',
        resource: 'Transaction',
        resourceId: id,
        severity: 'medium',
        details: { type: 'cleared_by_employee' },
      } as any);

      success(res, transaction, 'Transaction cleared');
    } catch (err) {
      next(err);
    }
  }

  async freezeCustomerAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const account = accountsDb.update(id, { status: 'frozen' });
      if (!account) {
        throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
      }

      await logAction(req as any, {
        action: 'account_freeze',
        resource: 'Account',
        resourceId: id,
        severity: 'high',
        details: { type: 'frozen_by_employee' },
      } as any);

      success(res, account, 'Account frozen');
    } catch (err) {
      next(err);
    }
  }

  async unfreezeCustomerAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const account = accountsDb.update(id, { status: 'active' });
      if (!account) {
        throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
      }

      await logAction(req as any, {
        action: 'account_freeze',
        resource: 'Account',
        resourceId: id,
        severity: 'high',
        details: { type: 'unfrozen_by_employee' },
      } as any);

      success(res, account, 'Account unfrozen');
    } catch (err) {
      next(err);
    }
  }

  async manageCustomerCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { action: cardAction } = req.body;

      let card;
      switch (cardAction) {
        case 'freeze':
          card = await CardService.freezeCard(id, '', req);
          break;
        case 'unfreeze':
          card = await CardService.unfreezeCard(id, '', req);
          break;
        case 'replace':
          card = await CardService.replaceCard(id, '', req);
          break;
        default:
          error(res, 'Invalid action', 400);
          return;
      }

      await logAction(req as any, {
        action: 'card_freeze',
        resource: 'Card',
        resourceId: id,
        severity: 'high',
        details: { type: `${cardAction}_by_employee` },
      } as any);

      success(res, card, `Card ${cardAction}d`);
    } catch (err) {
      next(err);
    }
  }

  async getCustomerCards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const cards = cardsDb.findMany((c) => c.userId === id);
      success(res, cards);
    } catch (err) {
      next(err);
    }
  }

  async getAuditHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      let logs = auditLogsDb.findMany((l) => l.actorId === id || l.resourceId === id);
      logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const total = logs.length;
      const start = (page - 1) * limit;
      const paged = logs.slice(start, start + limit);

      success(res, { logs: paged, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (err) {
      next(err);
    }
  }
}

export default new EmployeeController();
