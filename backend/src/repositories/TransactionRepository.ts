import { transactionsDb } from '@/database';
import type { Transaction } from '@/types';

export const TransactionRepository = {
  findAll: () => transactionsDb.findAll(),
  findById: (id: string) => transactionsDb.findById(id),
  findOne: (predicate: (t: Transaction) => boolean) => transactionsDb.findOne(predicate),
  findByAccount: (accountId: string) => transactionsDb.findMany((t) => t.fromAccount === accountId || t.toAccount === accountId),
  findByDateRange: (start: string, end: string) => transactionsDb.findMany((t) => t.createdAt >= start && t.createdAt <= end),
  findByStatus: (status: string) => transactionsDb.findMany((t) => t.status === status),
  findPending: () => transactionsDb.findMany((t) => t.status === 'pending'),
  findScheduled: () => transactionsDb.findMany((t) => t.isScheduled && t.scheduledDate !== null && t.scheduledDate! >= new Date().toISOString()),
  findByReference: (referenceNumber: string) => transactionsDb.findOne((t) => t.referenceNumber === referenceNumber),
  create: (data: Partial<Transaction>) => transactionsDb.create(data),
  update: (id: string, data: Partial<Transaction>) => transactionsDb.update(id, data),
  delete: (id: string) => transactionsDb.delete(id),
  getAccountStatement: (accountId: string, start: string, end: string) => transactionsDb.findMany(
    (t) => (t.fromAccount === accountId || t.toAccount === accountId) && t.createdAt >= start && t.createdAt <= end && ['completed', 'pending', 'flagged'].includes(t.status)
  ),
};
