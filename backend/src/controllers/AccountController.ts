import { Response, NextFunction } from 'express';
import { RequestWithUser } from '@/types';
import AccountService from '@/services/AccountService';
import { success } from '@/utils/apiResponse';

export class AccountController {
  async createAccount(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, branchCode, ifscCode } = req.body;
      const account = await AccountService.createAccount(
        { userId: req.user!.userId, type, branchCode, ifscCode },
        req
      );
      success(res, account, 'Account created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getAccounts(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await AccountService.getAccounts(req.user!.userId);
      success(res, accounts);
    } catch (err) {
      next(err);
    }
  }

  async getAccount(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const account = await AccountService.getAccountById(id, req.user!.userId);
      success(res, account);
    } catch (err) {
      next(err);
    }
  }

  async updateAccount(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const account = await AccountService.updateAccount(id, updates);
      success(res, account, 'Account updated');
    } catch (err) {
      next(err);
    }
  }

  async getAccountByNumber(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountNumber } = req.params;
      const account = await AccountService.getAccountByNumber(accountNumber);
      success(res, account);
    } catch (err) {
      next(err);
    }
  }

  async freezeAccount(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const account = await AccountService.freezeAccount(id, req.user!.userId, req);
      success(res, account, 'Account frozen');
    } catch (err) {
      next(err);
    }
  }

  async unfreezeAccount(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const account = await AccountService.unfreezeAccount(id, req.user!.userId, req);
      success(res, account, 'Account unfrozen');
    } catch (err) {
      next(err);
    }
  }

  async getStatement(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const statement = await AccountService.getAccountStatement(id, req.user!.userId, startDate, endDate);
      success(res, statement);
    } catch (err) {
      next(err);
    }
  }

  async deposit(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const account = await AccountService.deposit(id, req.user!.userId, amount, req);
      success(res, account, 'Deposit successful');
    } catch (err) {
      next(err);
    }
  }

  async downloadStatementPdf(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const pdf = await AccountService.generateStatementPdf(id, req.user!.userId, startDate, endDate);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=statement-${id}.pdf`);
      res.send(pdf);
    } catch (err) {
      next(err);
    }
  }
}

export default new AccountController();
