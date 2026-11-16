import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Download, ScrollText, ChevronDown, ChevronUp,
  Clock, User, Monitor,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface LogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorType: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metadata: Record<string, unknown>;
}

const mockLogs: LogEntry[] = [
  { id: 'l1', timestamp: '2024-01-15T10:30:00Z', actorName: 'Rajesh Kumar', actorType: 'employee', action: 'USER_LOGIN', resource: 'User Session', details: 'Employee logged in from office workstation', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', severity: 'info', metadata: { browser: 'Chrome', os: 'Windows', location: 'Mumbai, IN' } },
  { id: 'l2', timestamp: '2024-01-15T10:15:00Z', actorName: 'System', actorType: 'system', action: 'CONFIG_CHANGE', resource: 'System Configuration', details: 'Transaction daily limit changed from ₹1,00,000 to ₹2,00,000', ipAddress: '10.0.0.1', userAgent: 'System', severity: 'warning', metadata: { oldValue: 100000, newValue: 200000, changedBy: 'Super Admin' } },
  { id: 'l3', timestamp: '2024-01-15T09:45:00Z', actorName: 'Sneha Patel', actorType: 'employee', action: 'CARD_FROZEN', resource: 'Card ****7890', details: 'Card frozen due to suspected fraudulent transaction', ipAddress: '192.168.1.101', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', severity: 'critical', metadata: { cardId: 'c2', reason: 'Suspicious activity', previousStatus: 'active' } },
  { id: 'l4', timestamp: '2024-01-15T09:20:00Z', actorName: 'API Gateway', actorType: 'system', action: 'API_RATE_LIMIT', resource: 'Rate Limit', details: 'Rate limit exceeded for IP 203.0.113.42 - 150 requests in 60s', ipAddress: '203.0.113.42', userAgent: 'Unknown', severity: 'error', metadata: { requests: 150, window: 60, threshold: 100 } },
  { id: 'l5', timestamp: '2024-01-15T08:55:00Z', actorName: 'Amit Verma', actorType: 'employee', action: 'USER_LOOKUP', resource: 'User Profile', details: 'Viewed customer profile for user ID u4', ipAddress: '192.168.1.102', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0', severity: 'info', metadata: { targetUserId: 'u4', viewDuration: '45s' } },
  { id: 'l6', timestamp: '2024-01-15T08:30:00Z', actorName: 'System', actorType: 'system', action: 'BACKUP_COMPLETED', resource: 'Database', details: 'Automated daily backup completed: 2.4GB in 12m 34s', ipAddress: '10.0.0.1', userAgent: 'System', severity: 'info', metadata: { size: '2.4GB', duration: '12m 34s', status: 'success' } },
  { id: 'l7', timestamp: '2024-01-14T23:30:00Z', actorName: 'Neha Gupta', actorType: 'employee', action: 'PASSWORD_RESET', resource: 'User Credentials', details: 'Password reset initiated for user vikram.joshi@email.com', ipAddress: '192.168.1.103', userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0', severity: 'warning', metadata: { targetEmail: 'vikram.joshi@email.com', method: 'email_otp' } },
  { id: 'l8', timestamp: '2024-01-14T22:00:00Z', actorName: 'Security Scanner', actorType: 'system', action: 'VULNERABILITY_SCAN', resource: 'Infrastructure', details: 'Weekly vulnerability scan completed: 0 critical, 2 high, 5 medium', ipAddress: '10.0.0.2', userAgent: 'Nessus/10.5.0', severity: 'warning', metadata: { critical: 0, high: 2, medium: 5, low: 12 } },
  { id: 'l9', timestamp: '2024-01-14T20:15:00Z', actorName: 'Rajesh Kumar', actorType: 'employee', action: 'BENEFICIARY_BLOCKED', resource: 'Beneficiary', details: 'Blocked suspicious beneficiary account ****9876 for account ****6789', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', severity: 'critical', metadata: { beneficiaryAccount: '****9876', linkedAccount: '****6789', reason: 'Suspicious pattern' } },
  { id: 'l10', timestamp: '2024-01-14T18:00:00Z', actorName: 'System', actorType: 'system', action: 'LICENSE_CHECK', resource: 'Licensing', details: 'License validation successful - 365 days remaining', ipAddress: '10.0.0.1', userAgent: 'System', severity: 'info', metadata: { daysRemaining: 365, licenseType: 'enterprise' } },
  { id: 'l11', timestamp: '2024-01-14T16:30:00Z', actorName: 'Amit Verma', actorType: 'employee', action: 'ACCOUNT_CREATED', resource: 'Bank Account', details: 'Opened new savings account for Priya Patel', ipAddress: '192.168.1.102', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0', severity: 'info', metadata: { accountType: 'savings', initialDeposit: 10000 } },
  { id: 'l12', timestamp: '2024-01-14T14:00:00Z', actorName: 'External', actorType: 'external', action: 'LOGIN_FAILED', resource: 'Authentication', details: 'Failed login attempt for user admin@novabank.com from IP 185.220.101.42', ipAddress: '185.220.101.42', userAgent: 'python-requests/2.31.0', severity: 'critical', metadata: { attempts: 5, accountLocked: false, geoLocation: 'Unknown' } },
];

const severityConfig: Record<string, { variant: 'neutral' | 'warning' | 'danger'; label: string }> = {
  info: { variant: 'neutral', label: 'Info' },
  warning: { variant: 'warning', label: 'Warning' },
  error: { variant: 'danger', label: 'Error' },
  critical: { variant: 'danger', label: 'Critical' },
};

const actionTypes = [...new Set(mockLogs.map((l) => l.action))];

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    let result = mockLogs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.actorName.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q) || l.ipAddress.includes(q) || l.resource.toLowerCase().includes(q),
      );
    }
    if (actionFilter !== 'all') result = result.filter((l) => l.action === actionFilter);
    if (severityFilter !== 'all') result = result.filter((l) => l.severity === severityFilter);
    return result;
  }, [search, actionFilter, severityFilter]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text">Audit Logs</h1>
        <p className="text-sm text-text-secondary mt-0.5">Complete system audit trail with detailed event information.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by actor, action, resource, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9"
            />
          </div>
          <Button variant="secondary" iconLeft={<Download className="w-4 h-4" />}>Export CSV</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-text-muted" />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input-base w-auto py-1.5 text-xs">
            <option value="all">All Actions</option>
            {actionTypes.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="input-base w-auto py-1.5 text-xs">
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
          <span className="text-xs text-text-muted">{filtered.length} logs</span>
        </div>
      </motion.div>

      {loading ? (
        <LoadingSkeleton variant="table" count={8} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit logs found" description={search ? 'Try different search terms.' : 'No logs match your filters.'} />
      ) : (
        <motion.div variants={itemVariants} className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Actor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Severity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, idx) => (
                  <tr key={log.id} className={clsx('border-b border-surface-border transition-colors', idx % 2 === 0 ? 'bg-white' : 'bg-surface/50')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-sm text-text whitespace-nowrap">{format(new Date(log.timestamp), 'dd MMM HH:mm')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-sm font-medium text-text">{log.actorName}</span>
                        <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full border', log.actorType === 'system' ? 'bg-primary-50 text-primary-600 border-primary-200' : 'bg-surface text-text-muted border-surface-border')}>
                          {log.actorType}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-text">{log.action}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary">{log.resource}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-sm font-mono text-text-secondary">{log.ipAddress}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={severityConfig[log.severity].variant} size="sm" dot>
                        {severityConfig[log.severity].label}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                        className="p-1.5 rounded-button text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        {expandedRow === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {expandedRow && (() => {
            const log = filtered.find((l) => l.id === expandedRow)!;
            return (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-surface-border bg-surface p-5"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text">Details</h4>
                    <p className="text-sm text-text-secondary">{log.details}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">User Agent</span>
                        <span className="text-text max-w-[300px] truncate" title={log.userAgent}>{log.userAgent}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Actor Type</span>
                        <span className="capitalize text-text">{log.actorType}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Resource</span>
                        <span className="text-text">{log.resource}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-text">Metadata (JSON)</h4>
                    <div className="bg-[#0F172A] rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
}
