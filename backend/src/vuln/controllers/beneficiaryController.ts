import { Response } from 'express';
import { RequestWithUser } from '@/types';
import { beneficiariesDb, accountsDb, transactionsDb } from '@/database';
import { success, error } from '@/utils/apiResponse';

export function beneficiaryApproveController(req: RequestWithUser, res: Response): void {
  const beneficiaryId = req.params.id;
  const { amount = 100, sourceAccountId } = req.body;

  const beneficiary = beneficiariesDb.findById(beneficiaryId);
  if (!beneficiary) {
    error(res, 'Beneficiary record not found', 404);
    return;
  }

  // Proper authorization check on the beneficiary object
  if (req.user && beneficiary.userId && beneficiary.userId !== req.user.userId) {
    error(res, 'Access denied to this beneficiary', 403);
    return;
  }

  // VULNERABILITY (Multi-Stage IDOR):
  // The system allows passing an unvalidated `sourceAccountId` in the nested approval body.
  // It does NOT verify that sourceAccountId belongs to req.user.userId!
  let debitAccount;
  if (sourceAccountId) {
    debitAccount = accountsDb.findById(sourceAccountId);
  } else {
    debitAccount = accountsDb.findOne(a => a.userId === req.user?.userId);
  }

  if (!debitAccount) {
    error(res, 'Source account for disbursement not found', 404);
    return;
  }

  const transferAmount = Number(amount) || 100;
  if (debitAccount.balance < transferAmount) {
    error(res, 'Insufficient funds in designated source account', 400);
    return;
  }

  // Debit the unvalidated source account
  accountsDb.update(debitAccount.id, {
    balance: debitAccount.balance - transferAmount,
  });

  beneficiariesDb.update(beneficiary.id, {
    status: 'active',
  });

  const tx = transactionsDb.create({
    transactionId: `TXN_${Date.now()}`,
    fromAccount: debitAccount.accountNumber,
    toAccount: beneficiary.accountNumber,
    amount: transferAmount,
    currency: debitAccount.currency || 'USD',
    type: 'transfer',
    status: 'completed',
    description: `Disbursement to approved beneficiary: ${beneficiary.name}`,
    category: 'transfer',
    referenceNumber: `BEN_APP_${Date.now()}`,
    isScheduled: false,
    scheduledDate: null,
    isRecurring: false,
    fee: 0,
    totalAmount: transferAmount,
  });

  success(res, {
    beneficiaryId: beneficiary.id,
    beneficiaryName: beneficiary.name,
    debitedAccountId: debitAccount.id,
    debitedAccountNumber: debitAccount.accountNumber,
    amount: transferAmount,
    transactionId: tx.id,
    status: 'approved',
  }, 'Beneficiary approved and initial disbursement executed');
}
