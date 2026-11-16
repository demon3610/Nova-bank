import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  kycStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  lockUntil?: string | null;
  lastLoginAt?: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  userId: string;
  department: string;
  designation: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  userId: string;
  type: 'savings' | 'current';
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  branchCode: string;
  ifscCode: string;
  openedAt: string;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  cardNumber: string;
  cardholderName: string;
  userId: string;
  accountId: string;
  type: 'debit' | 'credit';
  network: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  pin: string;
  status: 'active' | 'frozen' | 'blocked' | 'replaced';
  isVirtual: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  spentToday: number;
  spentThisMonth: number;
  issuedAt: string;
  frozenAt?: string | null;
  replacedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  type: 'transfer' | 'credit' | 'debit' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'reversed' | 'flagged';
  description: string;
  category: string;
  referenceNumber: string;
  beneficiaryId?: string;
  isScheduled: boolean;
  scheduledDate: string | null;
  isRecurring: boolean;
  recurringPattern?: string | null;
  fee: number;
  totalAmount: number;
  processedAt?: string | null;
  completedAt?: string | null;
  failedReason?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Beneficiary {
  id: string;
  userId: string;
  accountNumber: string;
  ifscCode: string;
  name: string;
  nickname: string;
  bankName: string;
  transferLimit: number;
  isVerified: boolean;
  status: 'active' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'transaction' | 'security' | 'promotional' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorType: 'user' | 'employee' | 'admin' | 'system';
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceId?: string;
  ipAddress: string;
  userAgent: string;
  isValid: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: string;
  os: string;
  browser: string;
  ipAddress: string;
  isTrusted: boolean;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtpToken {
  id: string;
  identifier: string;
  otp: string;
  type: 'login' | 'register' | 'forgot_password' | 'transaction';
  attempts: number;
  maxAttempts: number;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  type: 'access' | 'refresh';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
  deviceId?: string;
  requestId?: string;
}
