import type { User } from '@/types';

export function generateAccountNumber(): string {
  const prefix = 'NB';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}${sequence}`;
}

export function generateCardNumber(): string {
  const groups: string[] = [];
  for (let i = 0; i < 4; i++) {
    const group = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    groups.push(group);
  }
  return groups.join(' ');
}

export function maskString(str: string, visibleChars: number = 4): string {
  if (str.length <= visibleChars) return str;
  const masked = '*'.repeat(str.length - visibleChars);
  return masked + str.slice(-visibleChars);
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...sanitized } = user;
  return sanitized;
}
