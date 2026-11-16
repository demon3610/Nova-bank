import bcrypt from 'bcryptjs';
import {
  usersDb,
  accountsDb,
  transactionsDb,
  beneficiariesDb,
  rolesDb,
} from '@/database';

const now = new Date().toISOString();
const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

export function seedVulnDatabase(force = false): void {
  // If not forcing and users already exist, skip
  if (!force && usersDb.count() > 0) {
    console.log('[SEED] Database already populated. Skipping.');
    return;
  }

  console.log('[SEED] Populating database with realistic target banking data...');

  // Roles
  rolesDb.create({ id: 'role-admin', name: 'admin', description: 'System Administrator', permissions: ['*'], isSystem: true, createdAt: now, updatedAt: now } as any);
  rolesDb.create({ id: 'role-employee', name: 'employee', description: 'Bank Employee', permissions: ['customers:read', 'customers:write', 'kyc:review', 'transactions:review'], isSystem: true, createdAt: now, updatedAt: now } as any);
  rolesDb.create({ id: 'role-user', name: 'user', description: 'Bank Customer', permissions: ['accounts:read', 'transactions:create', 'cards:read'], isSystem: true, createdAt: now, updatedAt: now } as any);

  // VIP Target: Bank Executive / CEO
  usersDb.create({
    id: 'u-ceo',
    email: 'ceo@novabank.com',
    phone: '+1-555-0999',
    password: defaultPasswordHash,
    firstName: 'Victor',
    lastName: 'Vance',
    role: 'user',
    roles: ['role-user'],
    kycStatus: 'verified',
    creditLimit: 1000000,
    isActive: true,
    isLocked: false,
    preferences: {
      theme: 'dark',
      notifications: { email: true, sms: true },
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: now,
  } as any);

  // Admin Account
  usersDb.create({
    id: 'u-admin',
    email: 'admin@novabank.com',
    phone: '+1-555-0100',
    password: defaultPasswordHash,
    firstName: 'Marcus',
    lastName: 'Admin',
    role: 'admin',
    roles: ['role-admin'],
    kycStatus: 'verified',
    creditLimit: 500000,
    isActive: true,
    isLocked: false,
    createdAt: now,
    updatedAt: now,
  } as any);

  // Standard Customer 1 (Attacker / Tester Account)
  usersDb.create({
    id: 'u-cust1',
    email: 'john.doe@email.com',
    phone: '+1-555-1001',
    password: defaultPasswordHash,
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    roles: ['role-user'],
    kycStatus: 'verified',
    creditLimit: 5000,
    isActive: true,
    isLocked: false,
    preferences: {
      theme: 'light',
      language: 'en',
    },
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: now,
  } as any);

  // Victim Customer 2
  usersDb.create({
    id: 'u-cust2',
    email: 'jane.smith@email.com',
    phone: '+1-555-1002',
    password: defaultPasswordHash,
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user',
    roles: ['role-user'],
    kycStatus: 'verified',
    creditLimit: 25000,
    isActive: true,
    isLocked: false,
    createdAt: '2024-02-20T10:30:00Z',
    updatedAt: now,
  } as any);

  // Accounts
  // CEO Vault Account
  accountsDb.create({
    id: 'acc-ceo-vault',
    accountNumber: '9900009999',
    userId: 'u-ceo',
    accountType: 'savings',
    balance: 2450000.00,
    currency: 'USD',
    status: 'active',
    branchCode: 'VIP001',
    openedAt: '2023-01-01T00:00:00Z',
    createdAt: now,
    updatedAt: now,
  } as any);

  // Customer 1 Checking Account (for Fast Transfer race conditions)
  accountsDb.create({
    id: 'acc-cust1-chk',
    accountNumber: '1000010001',
    userId: 'u-cust1',
    accountType: 'checking',
    balance: 500.00, // Ideal for race condition testing!
    currency: 'USD',
    status: 'active',
    branchCode: 'BR001',
    openedAt: '2024-01-15T08:00:00Z',
    createdAt: now,
    updatedAt: now,
  } as any);

  // Customer 1 Savings Account
  accountsDb.create({
    id: 'acc-cust1-sav',
    accountNumber: '1000010002',
    userId: 'u-cust1',
    accountType: 'savings',
    balance: 1500.00,
    currency: 'USD',
    status: 'active',
    branchCode: 'BR001',
    openedAt: '2024-01-15T08:00:00Z',
    createdAt: now,
    updatedAt: now,
  } as any);

  // Victim 2 Wealth Account (IDOR target)
  accountsDb.create({
    id: 'acc-cust2-wealth',
    accountNumber: '8800008888',
    userId: 'u-cust2',
    accountType: 'savings',
    balance: 890000.00,
    currency: 'USD',
    status: 'active',
    branchCode: 'BR002',
    openedAt: '2024-02-20T10:30:00Z',
    createdAt: now,
    updatedAt: now,
  } as any);

  // Beneficiaries
  beneficiariesDb.create({
    id: 'ben-cust1-1',
    userId: 'u-cust1',
    name: 'Offshore Holding LLC',
    accountNumber: '8800991122',
    bankName: 'Cayman Global Bank',
    routingNumber: '021000021',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  } as any);

  // Sample transactions
  transactionsDb.create({
    id: 'tx-init-01',
    accountId: 'acc-cust1-chk',
    type: 'deposit',
    amount: 500.00,
    currency: 'USD',
    status: 'completed',
    description: 'Initial balance funding',
    reference: 'DEP_INIT_001',
    createdAt: now,
    updatedAt: now,
  } as any);

  console.log('[SEED] Realistic banking target data successfully seeded.');
}
