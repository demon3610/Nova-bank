import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, Send, ArrowRightLeft, RefreshCw,
  CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight,
  Receipt,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { transactionService } from '@/services/transaction.service';
import type { Transaction } from '@/types';
import { usePagination } from '@/hooks/usePagination';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};



const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  completed: { color: 'bg-success-50 text-success-600 border-success-200', icon: CheckCircle },
  pending: { color: 'bg-warning-50 text-warning-600 border-warning-200', icon: Clock },
  failed: { color: 'bg-danger-50 text-danger-600 border-danger-200', icon: XCircle },
  cancelled: { color: 'bg-surface text-text-muted border-surface-border', icon: XCircle },
  processing: { color: 'bg-primary-50 text-primary-600 border-primary-200', icon: Clock },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status];
  if (!config) return <span className="text-xs text-text-secondary">{status}</span>;
  const Icon = config.icon;
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border', config.color)}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
}

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { page, limit, totalPages, hasNext, hasPrev, setPage, nextPage, prevPage } = usePagination({ total: transactions.length });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getTransactions();
      if (res.data) setTransactions(res.data);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const filtered = transactions.filter((txn) => {
    if (search && !txn.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && txn.type !== typeFilter) return false;
    if (statusFilter !== 'all' && txn.status !== statusFilter) return false;
    if (dateFrom && new Date(txn.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && new Date(txn.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Transactions</h1>
          <p className="text-sm text-text-secondary mt-0.5">View and manage all your transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTransactions} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} /> Refresh
          </button>
          <Link to="/dashboard/transfer" className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" /> New Transfer
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-base pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="input-base w-auto min-w-[130px]">
              <option value="all">All Types</option>
              <option value="transfer">Transfer</option>
              <option value="payment">Payment</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="refund">Refund</option>
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-base w-auto min-w-[130px]">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="processing">Processing</option>
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-base w-auto" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-base w-auto" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/50 border-b border-surface-border">
                <th className="text-left py-3.5 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Description</th>
                <th className="text-left py-3.5 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
                <th className="text-right py-3.5 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
                <th className="text-center py-3.5 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                <th className="text-right py-3.5 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Receipt className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-text mb-1">No transactions yet</h3>
                    <p className="text-sm text-text-muted mb-4">Your transactions will appear here once you start using your account.</p>
                    <Link to="/dashboard/transfer" className="btn-primary inline-flex items-center gap-2">
                      <Send className="w-4 h-4" /> Make a Transfer
                    </Link>
                  </td>
                </tr>
              ) : (
                paginated.map((txn) => (
                  <tr key={txn.id} className="border-b border-surface-border last:border-0 hover:bg-surface/30 transition-colors">
                    <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap text-xs">
                      {format(new Date(txn.createdAt), 'dd MMM yyyy')}
                      <br /><span className="text-text-muted">{format(new Date(txn.createdAt), 'HH:mm')}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* VULNERABILITY: XSS - renders unsanitized user input */}
                      <p className="font-medium text-text" dangerouslySetInnerHTML={{ __html: txn.description }} />
                      <p className="text-xs text-text-muted font-mono">{txn.referenceNumber}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary capitalize">
                        <ArrowRightLeft className="w-3.5 h-3.5" /> {txn.type}
                      </span>
                    </td>
                    <td className={clsx('py-3.5 px-4 text-right font-semibold', txn.type === 'credit' || txn.type === 'deposit' || txn.type === 'refund' || txn.type === 'interest' ? 'text-success-600' : 'text-danger-600')}>
                      {txn.type === 'credit' || txn.type === 'deposit' || txn.type === 'refund' || txn.type === 'interest' ? '+' : '-'}${txn.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center"><StatusBadge status={txn.status} /></td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text transition-colors" title="View Details">
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border bg-surface/30">
            <p className="text-xs text-text-muted">
              Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={prevPage} disabled={!hasPrev} className="p-1.5 rounded-md hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={clsx('w-7 h-7 text-xs font-medium rounded-md transition-colors', p === page ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-surface')}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={nextPage} disabled={!hasNext} className="p-1.5 rounded-md hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
