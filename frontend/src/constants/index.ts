const rawApiUrl = ((import.meta.env.VITE_API_URL as string) || '').trim();
export const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

export const TRANSACTION_TYPES = [
  'transfer',
  'deposit',
  'withdrawal',
  'payment',
  'refund',
  'fee',
  'interest',
] as const;

export const TRANSACTION_STATUSES = [
  'pending',
  'completed',
  'failed',
  'cancelled',
  'processing',
] as const;

export const CARD_STATUSES = ['active', 'frozen', 'cancelled', 'expired'] as const;

export const ACCOUNT_TYPES = ['savings', 'current'] as const;

export const KYC_STATUSES = ['pending', 'verified', 'rejected', 'not_started'] as const;

export const NOTIFICATION_TYPES = [
  'transaction',
  'security',
  'account',
  'promotion',
  'system',
  'kyc',
] as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  SGD: 'S$',
  HKD: 'HK$',
};

export const DATE_FORMATS = {
  full: 'PPPppp',
  short: 'PP',
  numeric: 'dd/MM/yyyy',
  time: 'HH:mm',
  dateTime: 'dd/MM/yyyy HH:mm',
  iso: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  api: 'yyyy-MM-dd',
  monthDay: 'dd MMM',
  monthYear: 'MMM yyyy',
} as const;

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  DASHBOARD: {
    HOME: '/dashboard',
    ACCOUNTS: '/dashboard/accounts',
    ACCOUNT_DETAIL: '/dashboard/accounts/:id',
    TRANSACTIONS: '/dashboard/transactions',
    TRANSACTION_DETAIL: '/dashboard/transactions/:id',
    TRANSFER: '/dashboard/transfer',
    CARDS: '/dashboard/cards',
    CARD_DETAIL: '/dashboard/cards/:id',
    BENEFICIARIES: '/dashboard/beneficiaries',
    STATEMENTS: '/dashboard/statements',
    PROFILE: '/dashboard/profile',
    SETTINGS: '/dashboard/settings',
    NOTIFICATIONS: '/dashboard/notifications',
  },
  EMPLOYEE: {
    HOME: '/employee',
    CUSTOMERS: '/employee/customers',
    CUSTOMER_DETAIL: '/employee/customers/:id',
    TRANSACTIONS: '/employee/transactions',
    APPROVALS: '/employee/approvals',
    CARDS: '/employee/cards',
    REPORTS: '/employee/reports',
  },
  ADMIN: {
    HOME: '/admin',
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:id',
    EMPLOYEES: '/admin/employees',
    ROLES: '/admin/roles',
    AUDIT_LOGS: '/admin/audit-logs',
    SETTINGS: '/admin/settings',
    SYSTEM: '/admin/system',
    ANALYTICS: '/admin/analytics',
  },
} as const;
