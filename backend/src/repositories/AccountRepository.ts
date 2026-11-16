import { accountsDb } from '@/database';
import type { Account } from '@/types';

export const AccountRepository = {
  findAll: () => accountsDb.findAll(),
  findById: (id: string) => accountsDb.findById(id),
  findOne: (predicate: (a: Account) => boolean) => accountsDb.findOne(predicate),
  findByUserId: (userId: string) => accountsDb.findMany((a) => a.userId === userId),
  findByAccountNumber: (accountNumber: string) => accountsDb.findOne((a) => a.accountNumber === accountNumber),
  findActive: () => accountsDb.findMany((a) => a.status === 'active'),
  create: (data: Partial<Account>) => accountsDb.create(data),
  update: (id: string, data: Partial<Account>) => accountsDb.update(id, data),
  delete: (id: string) => accountsDb.delete(id),
  updateBalance: (id: string, balance: number) => accountsDb.update(id, { balance }),
  freezeAccount: (id: string) => accountsDb.update(id, { status: 'frozen' }),
  unfreezeAccount: (id: string) => accountsDb.update(id, { status: 'active' }),
};
