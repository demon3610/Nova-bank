import { usersDb } from '@/database';
import type { User } from '@/types';

export const UserRepository = {
  findAll: () => usersDb.findAll(),
  findById: (id: string) => usersDb.findById(id),
  findOne: (predicate: (u: User) => boolean) => usersDb.findOne(predicate),
  findByEmail: (email: string) => usersDb.findOne((u) => u.email === email),
  findByEmailWithPassword: (email: string) => usersDb.findOne((u) => u.email === email),
  findByPhone: (phone: string) => usersDb.findOne((u) => u.phone === phone),
  findMany: (predicate: (u: User) => boolean) => usersDb.findMany(predicate),
  create: (data: Partial<User>) => usersDb.create(data),
  update: (id: string, data: Partial<User>) => usersDb.update(id, data),
  delete: (id: string) => usersDb.delete(id),
  count: (predicate?: (u: User) => boolean) => predicate ? usersDb.count(predicate) : usersDb.count(),
  paginate: (options: any) => usersDb.paginate(options),
  findLocked: () => usersDb.findMany((u) => u.isLocked),
  updateLastLogin: (id: string) => usersDb.update(id, { lastLoginAt: new Date().toISOString() }),
  incrementFailedAttempts: (id: string, user: User) => usersDb.update(id, { failedLoginAttempts: user.failedLoginAttempts + 1 }),
  resetFailedAttempts: (id: string) => usersDb.update(id, { failedLoginAttempts: 0, lockUntil: null }),
  lockAccount: (id: string) => usersDb.update(id, { isLocked: true, lockUntil: new Date(Date.now() + 3600000).toISOString() }),
};
