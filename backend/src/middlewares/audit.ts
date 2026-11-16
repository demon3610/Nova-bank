import { Request, Response, NextFunction } from 'express';
import { auditLogsDb } from '@/database';
import { RequestWithUser } from '@/types';
import { logger } from '@/config/logger';

export interface AuditLogData {
  action: 'registration' | 'login' | 'logout' | 'password_change' | 'deposit' | 'transfer' | 'card_freeze' | 'beneficiary_added' | 'kyc_update' | 'account_freeze' | 'employee_action' | 'admin_action';
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export async function logAction(
  req: Request,
  auditData: AuditLogData
): Promise<void> {
  try {
    const reqUser = (req as RequestWithUser).user;

    auditLogsDb.create({
      actorId: reqUser?.userId || 'system',
      actorType: reqUser ? 'user' : 'system',
      action: auditData.action,
      resource: auditData.resource,
      resourceId: auditData.resourceId || '',
      details: auditData.details || {},
      ipAddress: req.ip || req.headers['x-forwarded-for'] as string || '',
      userAgent: req.headers['user-agent'] || '',
      severity: auditData.severity || 'low',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Failed to create audit log:', err);
  }
}

export function auditMiddleware(auditData: AuditLogData) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      logAction(req, auditData).catch((err) => logger.error('Audit log error:', err));
      return originalJson(body);
    };

    next();
  };
}
