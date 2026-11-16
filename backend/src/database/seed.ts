import { usersDb, accountsDb, cardsDb, transactionsDb, beneficiariesDb, notificationsDb, rolesDb, employeesDb, devicesDb } from '.';
import bcrypt from 'bcryptjs';

const now = new Date().toISOString();
const hash = bcrypt.hashSync('Password123!', 12);

export function seedDatabase(): void {
  if (usersDb.count() > 0) return;

  const adminRole: any = { id: 'role-admin', name: 'admin', description: 'System administrator', permissions: ['*'], isSystem: true, createdAt: now, updatedAt: now };
  const employeeRole: any = { id: 'role-employee', name: 'employee', description: 'Bank employee', permissions: ['customers:read', 'customers:write', 'transactions:read', 'transactions:review', 'cards:manage', 'kyc:review'], isSystem: true, createdAt: now, updatedAt: now };
  const userRole: any = { id: 'role-user', name: 'user', description: 'Bank customer', permissions: ['accounts:read', 'accounts:write', 'transactions:create', 'transactions:read', 'cards:read', 'cards:manage', 'beneficiaries:manage'], isSystem: true, createdAt: now, updatedAt: now };
  rolesDb.create(adminRole);
  rolesDb.create(employeeRole);
  rolesDb.create(userRole);

  const adminUser: any = { id: 'u-admin', email: 'admin@novabank.com', phone: '+1-555-0100', password: hash, firstName: 'Raj', lastName: 'Admin', kycStatus: 'verified', isActive: true, isLocked: false, failedLoginAttempts: 0, roles: ['role-admin'], createdAt: now, updatedAt: now };
  usersDb.create(adminUser);

  const empUser: any = { id: 'u-emp', email: 'employee@novabank.com', phone: '+1-555-0101', password: hash, firstName: 'Priya', lastName: 'Sharma', kycStatus: 'verified', isActive: true, isLocked: false, failedLoginAttempts: 0, roles: ['role-employee'], createdAt: now, updatedAt: now };
  usersDb.create(empUser);

  const customer1: any = { id: 'u-cust1', email: 'john.doe@email.com', phone: '+1-555-1001', password: hash, firstName: 'John', lastName: 'Doe', address: '123 Main St, New York, NY', kycStatus: 'verified', isActive: true, isLocked: false, failedLoginAttempts: 0, roles: ['role-user'], createdAt: '2024-01-15T08:00:00Z', updatedAt: now };
  const customer2: any = { id: 'u-cust2', email: 'jane.smith@email.com', phone: '+1-555-1002', password: hash, firstName: 'Jane', lastName: 'Smith', address: '456 Oak Ave, Los Angeles, CA', kycStatus: 'verified', isActive: true, isLocked: false, failedLoginAttempts: 0, roles: ['role-user'], createdAt: '2024-02-20T10:30:00Z', updatedAt: now };
  const customer3: any = { id: 'u-cust3', email: 'bob.wilson@email.com', phone: '+1-555-1003', password: hash, firstName: 'Bob', lastName: 'Wilson', kycStatus: 'pending', isActive: true, isLocked: false, failedLoginAttempts: 0, roles: ['role-user'], createdAt: '2024-03-10T14:00:00Z', updatedAt: now };
  usersDb.create(customer1);
  usersDb.create(customer2);
  usersDb.create(customer3);

  employeesDb.create({ id: 'e-1', userId: 'u-emp', employeeId: 'EMP001', department: 'Operations', designation: 'Senior Officer', role: 'role-employee', permissions: [], isActive: true, joinedAt: '2023-06-01', createdAt: now, updatedAt: now } as any);
  employeesDb.create({ id: 'e-2', userId: 'u-admin', employeeId: 'ADM001', department: 'Administration', designation: 'System Admin', role: 'role-admin', permissions: [], isActive: true, joinedAt: '2022-01-15', createdAt: now, updatedAt: now } as any);

  const acc1: any = { id: 'a-1', accountNumber: '1000010001', userId: 'u-cust1', type: 'savings', balance: 52450.75, currency: 'USD', status: 'active', branchCode: 'BR001', ifscCode: 'NOVA0000001', openedAt: '2024-01-15T08:00:00Z', createdAt: now, updatedAt: now };
  const acc2: any = { id: 'a-2', accountNumber: '1000010002', userId: 'u-cust1', type: 'current', balance: 32300.00, currency: 'USD', status: 'active', branchCode: 'BR001', ifscCode: 'NOVA0000002', openedAt: '2024-01-15T08:00:00Z', createdAt: now, updatedAt: now };
  const acc3: any = { id: 'a-3', accountNumber: '1000010003', userId: 'u-cust2', type: 'savings', balance: 87500.00, currency: 'USD', status: 'active', branchCode: 'BR002', ifscCode: 'NOVA0000003', openedAt: '2024-02-20T10:30:00Z', createdAt: now, updatedAt: now };
  const acc4: any = { id: 'a-4', accountNumber: '1000010004', userId: 'u-cust2', type: 'current', balance: 12500.00, currency: 'USD', status: 'frozen', branchCode: 'BR002', ifscCode: 'NOVA0000004', openedAt: '2024-03-01T09:00:00Z', createdAt: now, updatedAt: now };
  const acc5: any = { id: 'a-5', accountNumber: '1000010005', userId: 'u-cust3', type: 'savings', balance: 1500.00, currency: 'USD', status: 'active', branchCode: 'BR001', ifscCode: 'NOVA0000005', openedAt: '2024-03-10T14:00:00Z', createdAt: now, updatedAt: now };
  accountsDb.create(acc1);
  accountsDb.create(acc2);
  accountsDb.create(acc3);
  accountsDb.create(acc4);
  accountsDb.create(acc5);

  const card1: any = { id: 'c-1', cardNumber: '4532015112345678', cardholderName: 'John Doe', userId: 'u-cust1', accountId: 'a-1', type: 'debit', network: 'Visa', expiryMonth: 12, expiryYear: 2026, cvv: 'hashed', pin: 'hashed', status: 'active', isVirtual: false, dailyLimit: 3000, monthlyLimit: 10000, spentToday: 450, spentThisMonth: 3200, issuedAt: '2024-01-20T10:00:00Z', createdAt: now, updatedAt: now };
  const card2: any = { id: 'c-2', cardNumber: '5424180112349012', cardholderName: 'John Doe', userId: 'u-cust1', accountId: 'a-2', type: 'credit', network: 'Mastercard', expiryMonth: 8, expiryYear: 2025, cvv: 'hashed', pin: 'hashed', status: 'active', isVirtual: true, dailyLimit: 5000, monthlyLimit: 20000, spentToday: 1200, spentThisMonth: 8500, issuedAt: '2024-02-01T09:00:00Z', createdAt: now, updatedAt: now };
  const card3: any = { id: 'c-3', cardNumber: '6011222333444555', cardholderName: 'Jane Smith', userId: 'u-cust2', accountId: 'a-3', type: 'debit', network: 'Discover', expiryMonth: 3, expiryYear: 2027, cvv: 'hashed', pin: 'hashed', status: 'frozen', isVirtual: false, dailyLimit: 2500, monthlyLimit: 8000, spentToday: 0, spentThisMonth: 1500, issuedAt: '2024-03-01T11:00:00Z', createdAt: now, updatedAt: now };
  cardsDb.create(card1);
  cardsDb.create(card2);
  cardsDb.create(card3);

  const txnTypes = ['transfer', 'payment', 'deposit', 'withdrawal', 'refund'] as const;
  const descriptions = ['Salary Deposit', 'Amazon Purchase', 'ATM Withdrawal', 'Netflix Subscription', 'Uber Ride', 'Grocery Store', 'Online Transfer', 'Bill Payment', 'Coffee Shop', 'Restaurant Payment'];
  for (let i = 0; i < 25; i++) {
    const daysAgo = i * 2;
    const txn: any = {
      id: `txn-${i + 1}`,
      transactionId: `TXN${String(i + 1).padStart(6, '0')}`,
      fromAccount: i % 3 === 0 ? 'a-1' : i % 3 === 1 ? 'a-2' : 'a-3',
      toAccount: i % 3 === 0 ? 'a-3' : i % 3 === 1 ? 'a-1' : 'a-2',
      amount: Math.floor(Math.random() * 5000) + 10,
      currency: 'USD',
      type: txnTypes[i % txnTypes.length],
      status: i === 2 ? 'pending' : i === 5 ? 'flagged' : 'completed',
      description: descriptions[i % descriptions.length],
      category: 'general',
      referenceNumber: `REF${String(i + 1).padStart(6, '0')}`,
      isScheduled: false,
      fee: i % 5 === 0 ? 2.50 : 0,
      totalAmount: i % 5 === 0 ? Math.floor(Math.random() * 5000) + 12.50 : Math.floor(Math.random() * 5000) + 10,
      processedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      completedAt: new Date(Date.now() - daysAgo * 86400000 + 60000).toISOString(),
      createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    };
    transactionsDb.create(txn);
  }

  devicesDb.create({ id: 'dvc-1', userId: 'u-cust1', deviceName: 'iPhone 15 Pro', deviceType: 'mobile', os: 'iOS 18', browser: 'Safari', ipAddress: '192.168.1.100', isTrusted: true, lastUsedAt: now, createdAt: now, updatedAt: now } as any);
  devicesDb.create({ id: 'dvc-2', userId: 'u-cust1', deviceName: 'MacBook Pro', deviceType: 'laptop', os: 'macOS 15', browser: 'Chrome', ipAddress: '192.168.1.101', isTrusted: true, lastUsedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: now, updatedAt: now } as any);

  notificationsDb.create({ id: 'notif-1', userId: 'u-cust1', type: 'transaction', title: 'Payment Received', message: 'You received $2,500 from Employer Inc.', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() } as any);
  notificationsDb.create({ id: 'notif-2', userId: 'u-cust1', type: 'security', title: 'Login Alert', message: 'New login from Chrome on Windows', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() } as any);
  notificationsDb.create({ id: 'notif-3', userId: 'u-cust1', type: 'account', title: 'Statement Ready', message: 'Your monthly statement is now available', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() } as any);
  notificationsDb.create({ id: 'notif-4', userId: 'u-cust1', type: 'system', title: 'App Update', message: 'New features available in latest update', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() } as any);

  beneficiariesDb.create({ id: 'ben-1', userId: 'u-cust1', accountNumber: '1000020001', ifscCode: 'HDFC0001234', name: 'Alice Johnson', nickname: 'Alice', bankName: 'HDFC Bank', transferLimit: 10000, isVerified: true, status: 'active', createdAt: now, updatedAt: now } as any);
  beneficiariesDb.create({ id: 'ben-2', userId: 'u-cust1', accountNumber: '1000020002', ifscCode: 'ICIC0005678', name: 'Mike Chen', nickname: 'Mike', bankName: 'ICICI Bank', transferLimit: 5000, isVerified: true, status: 'active', createdAt: now, updatedAt: now } as any);
}
