import { AccountRepository } from '@/repositories/AccountRepository';
import { TransactionRepository } from '@/repositories/TransactionRepository';
import { transactionsDb } from '@/database';
import { generateAccountNumber } from '@/utils/helpers';
import { generateUUID } from '@/security/crypto';
import { AppError } from '@/middlewares/errorHandler';
import { logAction } from '@/middlewares/audit';
import { Request } from 'express';
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';

export class AccountService {
  async createAccount(data: { userId: string; type: 'savings' | 'current'; branchCode?: string; ifscCode?: string; currency?: string }, req: Request) {
    const existingAccounts = AccountRepository.findByUserId(data.userId);
    if (existingAccounts.length >= 10) {
      throw new AppError('Maximum account limit reached', 400, 'MAX_ACCOUNTS');
    }

    const accountNumber = generateAccountNumber();

    const account = AccountRepository.create({
      accountNumber,
      userId: data.userId,
      type: data.type,
      balance: 0,
      currency: data.currency || 'INR',
      status: 'active',
      branchCode: data.branchCode || 'BR001',
      ifscCode: data.ifscCode || 'NOVA0000001',
      openedAt: new Date().toISOString(),
    });

    await logAction(req, {
      action: 'transfer',
      resource: 'Account',
      resourceId: account.id,
      severity: 'low',
      details: { type: 'account_created', accountNumber },
    });

    return account;
  }

  async getAccounts(userId: string) {
    return AccountRepository.findByUserId(userId);
  }

  async getAccountById(id: string, userId: string) {
    const account = AccountRepository.findById(id);
    if (!account) {
      throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
    }
    if (account.userId !== userId) {
      throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
    }
    return account;
  }

  async updateAccount(id: string, updates: Record<string, any>) {
    const account = AccountRepository.findById(id);
    if (!account) {
      throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
    }
    return AccountRepository.update(id, updates);
  }

  async getAccountByNumber(accountNumber: string) {
    const account = AccountRepository.findByAccountNumber(accountNumber);
    if (!account) {
      throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
    }
    return account;
  }

  async freezeAccount(id: string, userId: string, req: Request) {
    const account = await this.getAccountById(id, userId);
    if (account.status === 'frozen') {
      throw new AppError('Account is already frozen', 400, 'ALREADY_FROZEN');
    }

    const frozen = AccountRepository.freezeAccount(id);
    await logAction(req, {
      action: 'account_freeze',
      resource: 'Account',
      resourceId: id,
      severity: 'high',
      details: { type: 'account_frozen', accountNumber: account.accountNumber },
    });

    return frozen;
  }

  async unfreezeAccount(id: string, userId: string, req: Request) {
    const account = await this.getAccountById(id, userId);
    if (account.status !== 'frozen') {
      throw new AppError('Account is not frozen', 400, 'NOT_FROZEN');
    }

    const unfrozen = AccountRepository.unfreezeAccount(id);
    await logAction(req, {
      action: 'account_freeze',
      resource: 'Account',
      resourceId: id,
      severity: 'high',
      details: { type: 'account_unfrozen', accountNumber: account.accountNumber },
    });

    return unfrozen;
  }

  async deposit(accountId: string, userId: string, amount: number, req: Request) {
    if (!amount || amount <= 0) {
      throw new AppError('Invalid deposit amount', 400, 'INVALID_AMOUNT');
    }

    const account = await this.getAccountById(accountId, userId);
    if (account.status !== 'active') {
      throw new AppError('Account is not active', 400, 'ACCOUNT_NOT_ACTIVE');
    }

    const newBalance = account.balance + amount;
    AccountRepository.updateBalance(accountId, newBalance);

    TransactionRepository.create({
      transactionId: generateUUID(),
      fromAccount: 'deposit',
      toAccount: accountId,
      amount,
      currency: account.currency,
      type: 'credit',
      status: 'completed',
      description: 'Cash deposit',
      category: 'deposit',
      referenceNumber: `DEP${Date.now()}`,
      isScheduled: false,
      isRecurring: false,
      fee: 0,
      totalAmount: amount,
      completedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    });

    await logAction(req, {
      action: 'deposit',
      resource: 'Account',
      resourceId: accountId,
      severity: 'low',
      details: { type: 'deposit', amount },
    });

    return AccountRepository.findById(accountId);
  }

  async getAccountStatement(accountId: string, userId: string, startDate?: string, endDate?: string) {
    const account = await this.getAccountById(accountId, userId);

    const start = startDate ? dayjs(startDate).toISOString() : dayjs().subtract(3, 'month').toISOString();
    const end = endDate ? dayjs(endDate).toISOString() : new Date().toISOString();

    const transactions = transactionsDb.findMany((t) =>
      (t.fromAccount === accountId || t.toAccount === accountId) &&
      t.createdAt >= start &&
      t.createdAt <= end &&
      (t.status === 'completed' || t.status === 'pending' || t.status === 'flagged')
    );
    transactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return { account, transactions, startDate: start, endDate: end };
  }

  async generateStatementPdf(accountId: string, userId: string, startDate?: string, endDate?: string): Promise<Buffer> {
    const { account, transactions, startDate: start, endDate: end } = await this.getAccountStatement(accountId, userId, startDate, endDate);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(20).text('NovaBank Account Statement', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Account: ${account.accountNumber}`);
      doc.fontSize(12).text(`Type: ${account.type}`);
      doc.fontSize(12).text(`IFSC: ${account.ifscCode}`);
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${dayjs(start).format('DD/MM/YYYY')} - ${dayjs(end).format('DD/MM/YYYY')}`);
      doc.moveDown();
      doc.text(`Opening Balance: ${account.balance}`);
      doc.moveDown(2);

      doc.fontSize(14).text('Transactions', { underline: true });
      doc.moveDown();

      transactions.forEach((tx: any) => {
        doc.fontSize(10)
          .text(`${dayjs(tx.createdAt).format('DD/MM/YYYY HH:mm')} | ${tx.type.toUpperCase()} | ${tx.amount} ${tx.currency} | ${tx.status}`);
      });

      doc.end();
    });
  }
}

export default new AccountService();
