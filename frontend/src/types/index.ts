export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  kycStatus: KycStatus;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  userId: string;
  type: 'savings' | 'current';
  balance: number;
  currency: string;
  status: AccountStatus;
  ifscCode: string;
  branchCode: string;
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
  status: CardStatus;
  isVirtual: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  spentToday: number;
}

export interface Transaction {
  id: string;
  transactionId: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  category: string;
  referenceNumber: string;
  isScheduled: boolean;
  scheduledDate?: string;
  createdAt: string;
}

export interface Beneficiary {
  id: string;
  userId: string;
  accountNumber: string;
  ifscCode: string;
  name: string;
  nickname: string;
  bankName: string;
  isVerified: boolean;
  status: BeneficiaryStatus;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorType: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  severity: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface TransferPayload {
  fromAccount: string;
  toAccount: string;
  amount: number;
  description?: string;
}

export interface CardActionPayload {
  pin?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface KpiData {
  label: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

export type KycStatus = 'pending' | 'verified' | 'rejected' | 'not_started';
export type AccountStatus = 'active' | 'frozen' | 'closed' | 'dormant';
export type CardStatus = 'active' | 'frozen' | 'cancelled' | 'expired';
export type TransactionType =
  | 'transfer'
  | 'credit'
  | 'debit'
  | 'deposit'
  | 'withdrawal'
  | 'payment'
  | 'refund'
  | 'fee'
  | 'interest';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
export type BeneficiaryStatus = 'active' | 'inactive';
export type NotificationType =
  | 'transaction'
  | 'security'
  | 'account'
  | 'promotion'
  | 'system'
  | 'kyc';
