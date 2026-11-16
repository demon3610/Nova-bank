import EventEmitter from 'events';
import { logger } from '@/config/logger';

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }
}

export const eventEmitter = new AppEventEmitter();

export const EventConstants = {
  TRANSFER_COMPLETED: 'transfer.completed',
  TRANSFER_FAILED: 'transfer.failed',
  CARD_FROZEN: 'card.frozen',
  CARD_UNFROZEN: 'card.unfrozen',
  CARD_REPLACED: 'card.replaced',
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  PASSWORD_CHANGED: 'password.changed',
  PASSWORD_RESET: 'password.reset',
  KYC_UPDATED: 'kyc.updated',
  ACCOUNT_FROZEN: 'account.frozen',
  ACCOUNT_UNFROZEN: 'account.unfrozen',
  BENEFICIARY_ADDED: 'beneficiary.added',
  BENEFICIARY_REMOVED: 'beneficiary.removed',
  ADMIN_ACTION: 'admin.action',
  EMPLOYEE_ACTION: 'employee.action',
} as const;

eventEmitter.on(EventConstants.TRANSFER_COMPLETED, (data: Record<string, unknown>) => {
  logger.info('Event: Transfer completed', data);
});

eventEmitter.on(EventConstants.USER_REGISTERED, (data: Record<string, unknown>) => {
  logger.info('Event: User registered', data);
});

eventEmitter.on(EventConstants.CARD_FROZEN, (data: Record<string, unknown>) => {
  logger.info('Event: Card frozen', data);
});

eventEmitter.on(EventConstants.PASSWORD_CHANGED, (data: Record<string, unknown>) => {
  logger.info('Event: Password changed', data);
});

export default { eventEmitter, EventConstants };
