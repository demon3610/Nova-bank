import { Response } from 'express';
import { RequestWithUser } from '@/types';
import { accountsDb, transactionsDb } from '@/database';
import { success, error } from '@/utils/apiResponse';

export async function transferFastController(req: RequestWithUser, res: Response): Promise<void> {
  const { sourceAccountId, destinationAccountId, amount, description } = req.body;
  const numAmount = parseFloat(amount);

  if (!sourceAccountId || !destinationAccountId || isNaN(numAmount) || numAmount <= 0) {
    error(res, 'Invalid transfer parameters', 400);
    return;
  }

  const sourceAccount = accountsDb.findById(sourceAccountId);
  if (!sourceAccount) {
    error(res, 'Source account not found', 404);
    return;
  }

  const destAccount = accountsDb.findById(destinationAccountId) || accountsDb.findOne(a => a.accountNumber === destinationAccountId);
  if (!destAccount) {
    error(res, 'Destination account not found', 404);
    return;
  }

  // Time-of-Check: Verify current balance
  if (sourceAccount.balance < numAmount) {
    error(res, 'Insufficient funds for transfer', 400);
    return;
  }

  // VULNERABILITY (TOCTOU): Asynchronous window simulating ledger verification / external network I/O
  // Multiple concurrent requests will all pass the balance check before any debit executes.
  await new Promise((resolve) => setTimeout(resolve, 60));

  // Time-of-Use: Update balance using the stale snapshot
  const updatedSourceBalance = sourceAccount.balance - numAmount;
  accountsDb.update(sourceAccount.id, { balance: updatedSourceBalance });

  const updatedDestBalance = destAccount.balance + numAmount;
  accountsDb.update(destAccount.id, { balance: updatedDestBalance });

  const transaction = transactionsDb.create({
    transactionId: `TXN_${Date.now()}`,
    type: 'transfer',
    amount: numAmount,
    currency: sourceAccount.currency || 'USD',
    status: 'completed',
    description: description || `Fast transfer to ${destAccount.accountNumber}`,
    category: 'transfer',
    referenceNumber: `FT_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fromAccount: sourceAccount.accountNumber,
    toAccount: destAccount.accountNumber,
    isScheduled: false,
    scheduledDate: null,
    isRecurring: false,
    fee: 0,
    totalAmount: numAmount,
  });

  success(res, {
    transactionId: transaction.id,
    sourceAccountId: sourceAccount.id,
    newBalance: updatedSourceBalance,
    transferredAmount: numAmount,
    status: 'completed',
  }, 'Fast transfer processed successfully');
}
