import { TransactionRepository } from '@/repositories/TransactionRepository';
import { AccountRepository } from '@/repositories/AccountRepository';
import { generateUUID } from '@/security/crypto';
import { AppError } from '@/middlewares/errorHandler';
import { logAction } from '@/middlewares/audit';
import { Request } from 'express';
import { eventEmitter, EventConstants } from '@/events';

export class TransactionService {
  async createTransfer(data: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    description?: string;
    userId: string;
  }, req: Request) {
    const fromAccount = AccountRepository.findById(data.fromAccount);
    if (!fromAccount) {
      throw new AppError('Source account not found', 404, 'ACCOUNT_NOT_FOUND');
    }

    if (fromAccount.userId !== data.userId) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    if (fromAccount.status !== 'active') {
      throw new AppError('Source account is not active', 400, 'ACCOUNT_NOT_ACTIVE');
    }

    let toAccount = AccountRepository.findById(data.toAccount);
    if (!toAccount) {
      toAccount = AccountRepository.findByAccountNumber(data.toAccount);
    }
    if (!toAccount) {
      throw new AppError('Destination account not found', 404, 'ACCOUNT_NOT_FOUND');
    }

    if (toAccount.status !== 'active') {
      throw new AppError('Destination account is not active', 400, 'DEST_ACCOUNT_NOT_ACTIVE');
    }

    if (data.amount <= 0) {
      throw new AppError('Invalid amount', 400, 'INVALID_AMOUNT');
    }

    const fee = 0;
    const totalAmount = data.amount + fee;

    if (fromAccount.balance < totalAmount) {
      throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
    }

    const transaction = TransactionRepository.create({
      transactionId: generateUUID(),
      fromAccount: data.fromAccount,
      toAccount: toAccount.id,
      amount: data.amount,
      currency: 'INR',
      type: 'transfer',
      status: 'completed',
      description: data.description || 'Fund transfer',
      category: 'transfer',
      referenceNumber: `TXN${Date.now()}`,
      isScheduled: false,
      isRecurring: false,
      fee,
      totalAmount,
      completedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    });

    AccountRepository.updateBalance(data.fromAccount, fromAccount.balance - totalAmount);
    AccountRepository.updateBalance(toAccount.id, toAccount.balance + data.amount);

    eventEmitter.emit(EventConstants.TRANSFER_COMPLETED, {
      transactionId: transaction.transactionId,
      fromAccount: data.fromAccount,
      toAccount: toAccount.id,
      amount: data.amount,
    });

    await logAction(req, {
      action: 'transfer',
      resource: 'Transaction',
      resourceId: transaction.id,
      severity: 'medium',
      details: { amount: data.amount, fromAccount: data.fromAccount, toAccount: data.toAccount },
    });

    return transaction;
  }

  async getTransactions(userId: string) {
    const userAccounts = AccountRepository.findByUserId(userId);
    const accountIds = userAccounts.map((a) => a.id);
    const userTransactions = TransactionRepository.findAll().filter((t) =>
      accountIds.includes(t.fromAccount) || accountIds.includes(t.toAccount)
    );
    userTransactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return userTransactions;
  }

  async getTransactionById(id: string, userId: string) {
    const transaction = TransactionRepository.findById(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    const userAccounts = AccountRepository.findByUserId(userId);
    const accountIds = userAccounts.map((a) => a.id);
    if (!accountIds.includes(transaction.fromAccount) && !accountIds.includes(transaction.toAccount)) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    return transaction;
  }

  async scheduleTransfer(data: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    scheduledDate: string;
    description?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
    userId: string;
  }, req: Request) {
    const fromAccount = AccountRepository.findById(data.fromAccount);
    if (!fromAccount || fromAccount.userId !== data.userId) {
      throw new AppError('Access denied or account not found', 403, 'ACCESS_DENIED');
    }

    if (fromAccount.status !== 'active') {
      throw new AppError('Source account is not active', 400, 'ACCOUNT_NOT_ACTIVE');
    }

    const fee = 0;
    const totalAmount = data.amount + fee;

    const transaction = TransactionRepository.create({
      transactionId: generateUUID(),
      fromAccount: data.fromAccount,
      toAccount: data.toAccount,
      amount: data.amount,
      currency: 'INR',
      type: 'transfer',
      status: 'pending',
      description: data.description || 'Scheduled transfer',
      category: 'scheduled',
      referenceNumber: `SCH${Date.now()}`,
      isScheduled: true,
      scheduledDate: data.scheduledDate,
      isRecurring: data.isRecurring || false,
      recurringPattern: data.recurringPattern || null,
      fee,
      totalAmount,
    });

    await logAction(req, {
      action: 'transfer',
      resource: 'Transaction',
      resourceId: transaction.id,
      severity: 'low',
      details: { type: 'scheduled', amount: data.amount, scheduledDate: data.scheduledDate },
    });

    return transaction;
  }

  async cancelScheduledTransfer(id: string, userId: string, req: Request) {
    const transaction = TransactionRepository.findById(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    if (!transaction.isScheduled) {
      throw new AppError('Transaction is not scheduled', 400, 'NOT_SCHEDULED');
    }

    const userAccounts = AccountRepository.findByUserId(userId);
    const accountIds = userAccounts.map((a) => a.id);
    if (!accountIds.includes(transaction.fromAccount)) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    TransactionRepository.update(id, { status: 'failed', failedReason: 'Cancelled by user' });

    await logAction(req, {
      action: 'transfer',
      resource: 'Transaction',
      resourceId: id,
      severity: 'low',
      details: { type: 'scheduled_cancelled' },
    });

    return TransactionRepository.findById(id);
  }

  async getPendingTransfers(userId: string) {
    const userAccounts = AccountRepository.findByUserId(userId);
    const accountIds = userAccounts.map((a) => a.id);

    return TransactionRepository.findAll().filter((t) =>
      accountIds.includes(t.fromAccount) &&
      t.status === 'pending' &&
      t.isScheduled === false
    );
  }

  async getScheduledTransfers(userId: string) {
    const userAccounts = AccountRepository.findByUserId(userId);
    const accountIds = userAccounts.map((a) => a.id);

    const now = new Date().toISOString();
    return TransactionRepository.findAll().filter((t) =>
      accountIds.includes(t.fromAccount) &&
      t.isScheduled === true &&
      t.status === 'pending' &&
      t.scheduledDate !== null &&
      t.scheduledDate >= now
    );
  }

  async processPendingTransfers(): Promise<number> {
    const now = new Date().toISOString();
    const pendingTransfers = TransactionRepository.findAll().filter((t) =>
      t.isScheduled === true &&
      t.status === 'pending' &&
      t.scheduledDate !== null &&
      t.scheduledDate <= now
    );

    let processed = 0;
    for (const tx of pendingTransfers) {
      try {
        const fromAcc = AccountRepository.findById(tx.fromAccount);
        const toAcc = AccountRepository.findById(tx.toAccount);

        if (!fromAcc || !toAcc) {
          TransactionRepository.update(tx.id, { status: 'failed', failedReason: 'Account not found' });
          continue;
        }

        if (fromAcc.status !== 'active' || toAcc.status !== 'active') {
          TransactionRepository.update(tx.id, { status: 'failed', failedReason: 'Account not active' });
          continue;
        }

        if (fromAcc.balance < tx.totalAmount) {
          TransactionRepository.update(tx.id, { status: 'failed', failedReason: 'Insufficient balance' });
          continue;
        }

        AccountRepository.updateBalance(fromAcc.id, fromAcc.balance - tx.totalAmount);
        AccountRepository.updateBalance(toAcc.id, toAcc.balance + tx.amount);

        TransactionRepository.update(tx.id, {
          status: 'completed',
          processedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        });
        processed++;

        eventEmitter.emit(EventConstants.TRANSFER_COMPLETED, {
          transactionId: tx.transactionId,
          fromAccount: fromAcc.id,
          toAccount: toAcc.id,
          amount: tx.amount,
        });
      } catch (error) {
        TransactionRepository.update(tx.id, { status: 'failed', failedReason: (error as Error).message });
      }
    }

    return processed;
  }

  async flagSuspiciousTransaction(id: string, reason: string): Promise<void> {
    const transaction = TransactionRepository.findById(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    const metadata = (transaction.metadata || {}) as Record<string, unknown>;
    metadata.flaggedReason = reason;
    TransactionRepository.update(id, { status: 'flagged', metadata });
  }
}

export default new TransactionService();
