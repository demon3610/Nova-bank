import { get, post } from './api';
import type { ApiResponse, Account } from '@/types';

interface StatementRecord {
  date: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
}

interface StatementParams {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const accountService = {
  getAccounts: () => get<ApiResponse<Account[]>>('/accounts'),

  getAccount: (id: string) => get<ApiResponse<Account>>(`/accounts/${id}`),

  createAccount: (type: 'savings' | 'current', currency: string) =>
    post<ApiResponse<Account>>('/accounts', { type, currency }),

  freezeAccount: (id: string) =>
    post<ApiResponse<Account>>(`/accounts/${id}/freeze`),

  unfreezeAccount: (id: string) =>
    post<ApiResponse<Account>>(`/accounts/${id}/unfreeze`),

  getStatement: (id: string, params?: StatementParams) =>
    get<ApiResponse<StatementRecord[]>>(`/accounts/${id}/statement`, params as Record<string, unknown>),

  downloadStatementPdf: (id: string) =>
    get<Blob>(`/accounts/${id}/statement/pdf`, { responseType: 'blob' } as unknown as Record<string, unknown>),

  deposit: (id: string, amount: number) =>
    post<ApiResponse<Account>>(`/accounts/${id}/deposit`, { amount }),
};
