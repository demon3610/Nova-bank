import { cardsDb } from '@/database';
import type { Card } from '@/types';

export const CardRepository = {
  findAll: () => cardsDb.findAll(),
  findById: (id: string) => cardsDb.findById(id),
  findOne: (predicate: (c: Card) => boolean) => cardsDb.findOne(predicate),
  findByUserId: (userId: string) => cardsDb.findMany((c) => c.userId === userId),
  findByAccountId: (accountId: string) => cardsDb.findMany((c) => c.accountId === accountId),
  findActive: () => cardsDb.findMany((c) => c.status === 'active'),
  create: (data: Partial<Card>) => cardsDb.create(data),
  update: (id: string, data: Partial<Card>) => cardsDb.update(id, data),
  delete: (id: string) => cardsDb.delete(id),
  freezeCard: (id: string) => cardsDb.update(id, { status: 'frozen', frozenAt: new Date().toISOString() }),
  unfreezeCard: (id: string) => cardsDb.update(id, { status: 'active' }),
  replaceCard: (id: string, newCardData: Partial<Card>) => cardsDb.update(id, { ...newCardData, status: 'active', replacedAt: new Date().toISOString(), issuedAt: new Date().toISOString() }),
  updatePin: (id: string, pin: string) => cardsDb.update(id, { pin }),
  updateDailySpend: (id: string, amount: number) => cardsDb.update(id, { spentToday: amount, spentThisMonth: amount }),
};
