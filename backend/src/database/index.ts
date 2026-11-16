import { JsonDatabase } from './JsonDatabase';
import type {
  User, Account, Card, Transaction, Beneficiary, Notification,
  AuditLog, Session, Device, OtpToken, Role, Employee,
} from '@/types';

export const usersDb = new JsonDatabase<User>('users');
export const accountsDb = new JsonDatabase<Account>('accounts');
export const cardsDb = new JsonDatabase<Card>('cards');
export const transactionsDb = new JsonDatabase<Transaction>('transactions');
export const beneficiariesDb = new JsonDatabase<Beneficiary>('beneficiaries');
export const notificationsDb = new JsonDatabase<Notification>('notifications');
export const auditLogsDb = new JsonDatabase<AuditLog>('audit_logs');
export const sessionsDb = new JsonDatabase<Session>('sessions');
export const devicesDb = new JsonDatabase<Device>('devices');
export const otpTokensDb = new JsonDatabase<OtpToken>('otp_tokens');
export const rolesDb = new JsonDatabase<Role>('roles');
export const employeesDb = new JsonDatabase<Employee>('employees');
