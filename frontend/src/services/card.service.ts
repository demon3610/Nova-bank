import { get, post, put } from './api';
import type { ApiResponse, Card, CardActionPayload } from '@/types';

interface CreateCardPayload {
  accountId: string;
  cardholderName: string;
  type: 'debit' | 'credit';
  network: string;
  isVirtual?: boolean;
  dailyLimit?: number;
  monthlyLimit?: number;
}

interface SpendingData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  remainingDaily: number;
  remainingMonthly: number;
}

export const cardService = {
  getCards: () => get<ApiResponse<Card[]>>('/cards'),

  getCard: (id: string) => get<ApiResponse<Card>>(`/cards/${id}`),

  createCard: (payload: CreateCardPayload) =>
    post<ApiResponse<Card>>('/cards', payload),

  freezeCard: (id: string) =>
    post<ApiResponse<Card>>(`/cards/${id}/freeze`),

  unfreezeCard: (id: string) =>
    post<ApiResponse<Card>>(`/cards/${id}/unfreeze`),

  replaceCard: (id: string) =>
    post<ApiResponse<Card>>(`/cards/${id}/replace`),

  updatePin: (id: string, pin: string) =>
    put<ApiResponse<null>>(`/cards/${id}/pin`, { pin }),

  updateLimit: (id: string, payload: CardActionPayload) =>
    put<ApiResponse<Card>>(`/cards/${id}/limits`, payload),

  getSpending: (id: string) =>
    get<ApiResponse<SpendingData>>(`/cards/${id}/spending`),
};
