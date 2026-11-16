import { get, post } from './api';
import type { ApiResponse, Transaction, TransferPayload } from '@/types';

interface TransactionParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  accountId?: string;
}

export const transactionService = {
  transfer: (payload: TransferPayload) =>
    post<ApiResponse<Transaction>>('/transactions/transfer', payload),

  getTransactions: (params?: TransactionParams) =>
    get<ApiResponse<Transaction[]>>('/transactions', params as Record<string, unknown>),

  getTransaction: (id: string) =>
    get<ApiResponse<Transaction>>(`/transactions/${id}`),

  scheduleTransfer: (payload: TransferPayload & { scheduledDate: string }) =>
    post<ApiResponse<Transaction>>('/transactions/schedule', payload),

  getScheduled: () =>
    get<ApiResponse<Transaction[]>>('/transactions/scheduled'),

  getPending: () =>
    get<ApiResponse<Transaction[]>>('/transactions/pending'),

  cancelScheduled: (id: string) =>
    post<ApiResponse<null>>(`/transactions/${id}/cancel`),
};
