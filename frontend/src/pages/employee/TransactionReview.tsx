import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, ArrowRightLeft, Filter, CheckCircle, AlertTriangle,
  XCircle, ChevronDown, ChevronUp, User, Building2,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import type { Transaction, TransactionStatus } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ReviewTransaction extends Transaction {
  senderName: string;
  receiverName: string;
  flagged: boolean;
  flagReason?: string;
}

const mockTransactions: ReviewTransaction[] = [
  { id: 't1', transactionId: 'TXN001', fromAccount: '****2345', toAccount: '****6789', amount: 50000, currency: 'INR', type: 'transfer', status: 'completed', description: 'Salary payment', category: 'salary', referenceNumber: 'REF001', isScheduled: false, createdAt: '2024-01-15T10:30:00Z', senderName: 'Rahul Sharma', receiverName: 'Priya Patel', flagged: false },
  { id: 't2', transactionId: 'TXN002', fromAccount: '****1234', toAccount: '****5678', amount: 200000, currency: 'INR', type: 'transfer', status: 'pending', description: 'Large transfer', category: 'other', referenceNumber: 'REF002', isScheduled: false, createdAt: '2024-01-15T11:00:00Z', senderName: 'Amit Singh', receiverName: 'Sneha Reddy', flagged: true, flagReason: 'Amount exceeds threshold' },
  { id: 't3', transactionId: 'TXN003', fromAccount: '****9012', toAccount: '****3456', amount: 10000, currency: 'INR', type: 'payment', status: 'completed', description: 'Online payment', category: 'shopping', referenceNumber: 'REF003', isScheduled: false, createdAt: '2024-01-14T09:15:00Z', senderName: 'Vikram Joshi', receiverName: 'Ananya Singh', flagged: false },
  { id: 't4', transactionId: 'TXN004', fromAccount: '****6789', toAccount: 'EXTERNAL', amount: 750000, currency: 'INR', type: 'transfer', status: 'processing', description: 'Foreign transfer', category: 'transfer', referenceNumber: 'REF004', isScheduled: false, createdAt: '2024-01-14T14:30:00Z', senderName: 'Priya Patel', receiverName: 'External Beneficiary', flagged: true, flagReason: 'High-value foreign transfer' },
  { id: 't5', transactionId: 'TXN005', fromAccount: '****2345', toAccount: '****9012', amount: 2500, currency: 'INR', type: 'payment', status: 'failed', description: 'Failed payment', category: 'utilities', referenceNumber: 'REF005', isScheduled: false, createdAt: '2024-01-13T16:45:00Z', senderName: 'Rahul Sharma', receiverName: 'Vikram Joshi', flagged: false },
  { id: 't6', transactionId: 'TXN006', fromAccount: 'INTERNAL', toAccount: '****3456', amount: 500000, currency: 'INR', type: 'deposit', status: 'pending', description: 'Large cash deposit', category: 'deposit', referenceNumber: 'REF006', isScheduled: false, createdAt: '2024-01-13T08:00:00Z', senderName: 'Branch Deposit', receiverName: 'Ananya Singh', flagged: true, flagReason: 'Large deposit - AML check required' },
];

const statusVariant: Record<TransactionStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  completed: 'success',
  pending: 'warning',
  processing: 'info',
  failed: 'danger',
  cancelled: 'neutral',
};

const timelineSteps = [
  { label: 'Initiated', time: '10:30 AM', completed: true },
  { label: 'Under Review', time: '10:32 AM', completed: true },
  { label: 'Approved', time: '10:35 AM', completed: true },
  { label: 'Completed', time: '10:36 AM', completed: true },
];

type ReviewAction = 'clear' | 'flag' | 'reverse';

const actionConfig: Record<ReviewAction, { label: string; icon: typeof CheckCircle; variant: 'success' | 'warning' | 'danger'; confirmTitle: string; confirmMessage: string }> = {
  clear: { label: 'Clear', icon: CheckCircle, variant: 'success', confirmTitle: 'Clear Transaction', confirmMessage: 'Mark this transaction as cleared and legitimate?' },
  flag: { label: 'Flag', icon: AlertTriangle, variant: 'warning', confirmTitle: 'Flag Transaction', confirmMessage: 'Flag this transaction for further review?' },
  reverse: { label: 'Reverse', icon: XCircle, variant: 'danger', confirmTitle: 'Reverse Transaction', confirmMessage: 'This will reverse the transaction. Are you sure?' },
};

export default function TransactionReview() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ txn: ReviewTransaction; action: ReviewAction } | null>(null);
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    let result = mockTransactions;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.transactionId.toLowerCase().includes(q) ||
          t.senderName.toLowerCase().includes(q) ||
          t.receiverName.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') result = result.filter((t) => t.status === statusFilter);
    if (typeFilter !== 'all') result = result.filter((t) => t.type === typeFilter);
    if (flaggedOnly) result = result.filter((t) => t.flagged);
    return result;
  }, [search, statusFilter, typeFilter, flaggedOnly]);

  const handleAction = () => {
    setConfirmAction(null);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text">Transaction Review</h1>
        <p className="text-sm text-text-secondary mt-0.5">Review and manage flagged transactions.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by transaction ID, name, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-base w-auto py-1.5 text-xs"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-base w-auto py-1.5 text-xs"
          >
            <option value="all">All Types</option>
            <option value="transfer">Transfer</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="payment">Payment</option>
            <option value="refund">Refund</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-surface-border text-primary-600 focus:ring-primary-500"
            />
            Flagged only
          </label>
          <span className="text-xs text-text-muted">{filtered.length} transactions</span>
        </div>
      </motion.div>

      {loading ? (
        <LoadingSkeleton variant="table" count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ArrowRightLeft} title="No transactions found" description={search ? 'Try different search terms.' : 'No transactions match your filters.'} />
      ) : (
        <motion.div variants={itemVariants} className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Sender</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Receiver</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Flagged</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn, idx) => (
                  <tr key={txn.id} className={clsx('border-b border-surface-border transition-colors', idx % 2 === 0 ? 'bg-white' : 'bg-surface/50')}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-text-secondary">{txn.transactionId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text">{format(new Date(txn.createdAt), 'dd MMM yyyy')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text">{txn.senderName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text">{txn.receiverName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('text-sm font-medium', txn.amount > 100000 ? 'text-danger-600' : 'text-text')}>
                        ₹{txn.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={statusVariant[txn.status]} size="sm">{txn.status}</StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      {txn.flagged ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Flagged
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpandedRow(expandedRow === txn.id ? null : txn.id)}
                        className="p-1.5 rounded-button text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        {expandedRow === txn.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {expandedRow && (() => {
            const txn = filtered.find((t) => t.id === expandedRow)!;
            return (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-surface-border bg-surface p-5"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-text">Transaction Details</h4>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Transaction ID</span>
                        <span className="text-xs font-mono text-text">{txn.transactionId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Reference</span>
                        <span className="text-xs text-text">{txn.referenceNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Description</span>
                        {/* VULNERABILITY: XSS - renders unsanitized user input */}
                        <span className="text-xs text-text" dangerouslySetInnerHTML={{ __html: txn.description }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Category</span>
                        <span className="text-xs capitalize text-text">{txn.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Type</span>
                        <span className="text-xs capitalize text-text">{txn.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Amount</span>
                        <span className="text-xs font-medium text-text">₹{txn.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Date</span>
                        <span className="text-xs text-text">{format(new Date(txn.createdAt), 'dd MMM yyyy HH:mm')}</span>
                      </div>
                      {txn.flagged && txn.flagReason && (
                        <div className="p-2.5 rounded-lg bg-warning-50 border border-warning-200">
                          <p className="text-xs font-medium text-warning-700">Flag Reason</p>
                          <p className="text-xs text-warning-600 mt-0.5">{txn.flagReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-text">Sender / Receiver</h4>
                    <div className="p-3 rounded-lg bg-white border border-surface-border space-y-2">
                      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Sender</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text">{txn.senderName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text">{txn.fromAccount}</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-surface-border space-y-2">
                      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Receiver</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text">{txn.receiverName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text">{txn.toAccount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-text">Timeline</h4>
                    <div className="space-y-0">
                      {timelineSteps.map((step, i) => (
                        <div key={step.label} className="flex items-start gap-3 pb-4 relative">
                          {i < timelineSteps.length - 1 && (
                            <div className={clsx('absolute left-[7px] top-4 w-0.5 h-full', step.completed ? 'bg-success-500' : 'bg-surface-border')} />
                          )}
                          <div className={clsx('w-[15px] h-[15px] rounded-full border-2 flex-shrink-0 mt-0.5', step.completed ? 'bg-success-500 border-success-500' : 'bg-white border-surface-border')} />
                          <div>
                            <p className={clsx('text-sm font-medium', step.completed ? 'text-text' : 'text-text-muted')}>{step.label}</p>
                            <p className="text-xs text-text-muted">{step.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="primary" iconLeft={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => setConfirmAction({ txn, action: 'clear' })}>Clear</Button>
                      <Button size="sm" variant="secondary" iconLeft={<AlertTriangle className="w-3.5 h-3.5" />} onClick={() => setConfirmAction({ txn, action: 'flag' })}>Flag</Button>
                      <Button size="sm" variant="danger" iconLeft={<XCircle className="w-3.5 h-3.5" />} onClick={() => setConfirmAction({ txn, action: 'reverse' })}>Reverse</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </motion.div>
      )}

      {confirmAction && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          title={actionConfig[confirmAction.action].confirmTitle}
          size="sm"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setConfirmAction(null)}>Cancel</Button>
              <Button
                variant={confirmAction.action === 'clear' ? 'primary' : confirmAction.action === 'flag' ? 'secondary' : 'danger'}
                size="sm"
                onClick={handleAction}
              >
                {actionConfig[confirmAction.action].label}
              </Button>
            </>
          }
        >
          <p className="text-sm text-text-secondary">{actionConfig[confirmAction.action].confirmMessage}</p>
        </Modal>
      )}
    </motion.div>
  );
}
