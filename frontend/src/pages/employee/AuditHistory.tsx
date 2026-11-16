import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Download, History, Clock, User,
  Monitor,
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

interface AuditEntry {
  id: string;
  timestamp: string;
  employeeName: string;
  action: string;
  details: string;
  ip: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const mockAudits: AuditEntry[] = [
  { id: 'a1', timestamp: '2024-01-15T10:30:00Z', employeeName: 'Rajesh Kumar', action: 'KYC Verified', details: 'Verified identity documents for user Rahul Sharma', ip: '192.168.1.100', severity: 'low' },
  { id: 'a2', timestamp: '2024-01-15T10:15:00Z', employeeName: 'Sneha Patel', action: 'Card Frozen', details: 'Frozen debit card ending in 7890 due to suspicious activity', ip: '192.168.1.101', severity: 'high' },
  { id: 'a3', timestamp: '2024-01-15T09:45:00Z', employeeName: 'Amit Verma', action: 'Account Activated', details: 'Activated savings account for Priya Patel', ip: '192.168.1.102', severity: 'low' },
  { id: 'a4', timestamp: '2024-01-15T09:20:00Z', employeeName: 'Rajesh Kumar', action: 'Transaction Reversed', details: 'Reversed fraudulent transaction TXN004 for ₹75,000', ip: '192.168.1.100', severity: 'critical' },
  { id: 'a5', timestamp: '2024-01-15T08:55:00Z', employeeName: 'Neha Gupta', action: 'User Lookup', details: 'Viewed customer profile for Ananya Singh', ip: '192.168.1.103', severity: 'medium' },
  { id: 'a6', timestamp: '2024-01-15T08:30:00Z', employeeName: 'Sneha Patel', action: 'Limit Changed', details: 'Increased daily withdrawal limit for account ****2345', ip: '192.168.1.101', severity: 'high' },
  { id: 'a7', timestamp: '2024-01-15T08:00:00Z', employeeName: 'Vikram Joshi', action: 'Login', details: 'Employee logged in from new device', ip: '10.0.0.50', severity: 'medium' },
  { id: 'a8', timestamp: '2024-01-14T23:30:00Z', employeeName: 'System', action: 'Backup Completed', details: 'Automated daily database backup completed successfully', ip: '10.0.0.1', severity: 'low' },
  { id: 'a9', timestamp: '2024-01-14T22:00:00Z', employeeName: 'System', action: 'Security Scan', details: 'Vulnerability scan completed - 0 critical findings', ip: '10.0.0.1', severity: 'medium' },
  { id: 'a10', timestamp: '2024-01-14T20:15:00Z', employeeName: 'Rajesh Kumar', action: 'Beneficiary Blocked', details: 'Blocked suspicious beneficiary added to account ****6789', ip: '192.168.1.100', severity: 'critical' },
  { id: 'a11', timestamp: '2024-01-14T18:00:00Z', employeeName: 'Amit Verma', action: 'Report Generated', details: 'Generated monthly AML compliance report', ip: '192.168.1.102', severity: 'low' },
  { id: 'a12', timestamp: '2024-01-14T16:30:00Z', employeeName: 'Neha Gupta', action: 'Password Reset', details: 'Initiated password reset for user vikram.joshi@email.com', ip: '192.168.1.103', severity: 'high' },
];

const severityConfig: Record<string, { variant: 'neutral' | 'warning' | 'danger' | 'danger'; label: string; dotColor: string }> = {
  low: { variant: 'neutral', label: 'Low', dotColor: 'bg-text-muted' },
  medium: { variant: 'warning', label: 'Medium', dotColor: 'bg-warning-500' },
  high: { variant: 'danger', label: 'High', dotColor: 'bg-orange-500' },
  critical: { variant: 'danger', label: 'Critical', dotColor: 'bg-danger-500' },
};

const actionTypes = [...new Set(mockAudits.map((a) => a.action))];

export default function AuditHistory() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    let result = mockAudits;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.employeeName.toLowerCase().includes(q) || a.action.toLowerCase().includes(q) || a.details.toLowerCase().includes(q) || a.ip.includes(q),
      );
    }
    if (actionFilter !== 'all') result = result.filter((a) => a.action === actionFilter);
    if (severityFilter !== 'all') result = result.filter((a) => a.severity === severityFilter);
    return result;
  }, [search, actionFilter, severityFilter]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text">Audit History</h1>
        <p className="text-sm text-text-secondary mt-0.5">Track all employee actions and system events.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by employee, action, details, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9"
            />
          </div>
          <Button variant="secondary" size="md" iconLeft={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-text-muted" />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input-base w-auto py-1.5 text-xs">
            <option value="all">All Actions</option>
            {actionTypes.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="input-base w-auto py-1.5 text-xs">
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <span className="text-xs text-text-muted">{filtered.length} entries</span>
        </div>
      </motion.div>

      {loading ? (
        <LoadingSkeleton variant="table" count={8} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={History} title="No audit entries found" description={search ? 'Try different search terms.' : 'No audit logs match your filters.'} />
      ) : (
        <motion.div variants={itemVariants} className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Severity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, idx) => {
                  const sev = severityConfig[entry.severity];
                  return (
                    <tr
                      key={entry.id}
                      className={clsx(
                        'border-b border-surface-border transition-colors',
                        idx % 2 === 0 ? 'bg-white' : 'bg-surface/50',
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-text-muted" />
                          <span className="text-sm text-text">{format(new Date(entry.timestamp), 'dd MMM yyyy HH:mm')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-text-muted" />
                          <span className="text-sm font-medium text-text">{entry.employeeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text">{entry.action}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-text-secondary max-w-[250px] truncate" title={entry.details}>{entry.details}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5 text-text-muted" />
                          <span className="text-sm font-mono text-text-secondary">{entry.ip}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge variant={sev.variant} size="sm" dot>
                          {sev.label}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
