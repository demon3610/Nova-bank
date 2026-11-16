import { Response } from 'express';
import { RequestWithUser } from '@/types';
import { usersDb, accountsDb, transactionsDb, auditLogsDb } from '@/database';
import { success, error } from '@/utils/apiResponse';

export function adminExportController(req: RequestWithUser, res: Response): void {
  const originalUrlHeader = req.headers['x-original-url'] as string;
  const rewriteUrlHeader = req.headers['x-rewrite-url'] as string;
  const forwardedPrefix = req.headers['x-forwarded-prefix'] as string;

  // VULNERABILITY (Reverse-Proxy Header / Normalization Bypass):
  // When an upstream proxy or gateway passes X-Original-URL or X-Rewrite-URL matching this endpoint,
  // the middleware bypasses standard admin authorization checks, trusting the upstream header.
  const isHeaderBypass =
    originalUrlHeader === '/api/admin/system/export' ||
    rewriteUrlHeader === '/api/admin/system/export' ||
    Boolean(forwardedPrefix && forwardedPrefix.includes('admin'));

  const isAdminUser = req.user?.roles?.includes('admin') || (req.user as any)?.isAdmin;

  if (!isAdminUser && !isHeaderBypass) {
    error(res, 'Access Denied: Administrator role required', 403);
    return;
  }

  // Dump system database snapshot for export
  const users = usersDb.findAll().map(u => ({
    id: u.id,
    email: u.email,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || (u as any).name || 'User',
    roles: u.roles,
    passwordHash: u.password,
    kycStatus: (u as any).kycStatus || 'pending',
  }));

  const accounts = accountsDb.findAll();
  const transactions = transactionsDb.findAll();
  const auditLogs = auditLogsDb.findAll().slice(-50);

  success(res, {
    exportTimestamp: new Date().toISOString(),
    authorizedVia: isHeaderBypass ? 'Gateway-Rewrite-Header' : 'Admin-Session',
    systemOverview: {
      totalUsers: users.length,
      totalAccounts: accounts.length,
      totalTransactions: transactions.length,
    },
    users,
    accounts,
    transactions,
    recentAuditLogs: auditLogs,
  }, 'System master export generated');
}
