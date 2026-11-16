import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Wallet, PiggyBank, Snowflake, Flame, Download, Info,
  AlertTriangle, CheckCircle, XCircle, Clock, FileDown,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { accountService } from '@/services/account.service';
import { transactionService } from '@/services/transaction.service';
import type { Account, Transaction } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};



const statusColors: Record<string, string> = {
  completed: 'bg-success-50 text-success-600 border-success-200',
  pending: 'bg-warning-50 text-warning-600 border-warning-200',
  failed: 'bg-danger-50 text-danger-600 border-danger-200',
  cancelled: 'bg-surface text-text-muted border-surface-border',
  processing: 'bg-primary-50 text-primary-600 border-primary-200',
  active: 'bg-success-50 text-success-600 border-success-200',
  frozen: 'bg-warning-50 text-warning-600 border-warning-200',
};

const statusIcons: Record<string, React.ElementType> = {
  completed: CheckCircle, pending: Clock, failed: XCircle, cancelled: XCircle, processing: Clock,
};

function StatusBadge({ status }: { status: string }) {
  const Icon = statusIcons[status] || AlertTriangle;
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border', statusColors[status] || 'bg-surface text-text-secondary border-surface-border')}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
}

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) { setError(true); setLoading(false); return; }
    const fetchData = async () => {
      try {
        const [accRes, txnRes] = await Promise.all([
          accountService.getAccount(id),
          transactionService.getTransactions({ accountId: id }),
        ]);
        if (accRes.data) {
          setAccount(accRes.data);
          setIsFrozen(accRes.data.status === 'frozen');
        } else {
          setError(true);
        }
        if (txnRes.data) setTransactions(txnRes.data);
      } catch {
        setError(true);
        toast.error('Failed to load account details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFreezeToggle = async () => {
    if (!account) return;
    setActionLoading(true);
    try {
      if (isFrozen) {
        await accountService.unfreezeAccount(account.id);
        setIsFrozen(false);
        toast.success('Account unfrozen');
      } else {
        await accountService.freezeAccount(account.id);
        setIsFrozen(true);
        toast.success('Account frozen');
      }
    } catch {
      toast.error('Failed to update account status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (error || !account) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <Link to="/dashboard/accounts" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </Link>
        <motion.div variants={itemVariants} className="card-base p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-danger-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-text mb-1">Account Not Found</h3>
          <p className="text-sm text-text-muted mb-4">The account you're looking for doesn't exist or has been removed.</p>
          <Link to="/dashboard/accounts" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> View All Accounts
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  const Icon = account.type === 'savings' ? PiggyBank : Wallet;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Link to="/dashboard/accounts" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={clsx(
              'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
              account.type === 'savings' ? 'bg-success-50' : 'bg-primary-50',
            )}>
              <Icon className={clsx('w-7 h-7', account.type === 'savings' ? 'text-success-600' : 'text-primary-600')} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-text capitalize">{account.type} Account</h1>
                <StatusBadge status={isFrozen ? 'frozen' : 'active'} />
              </div>
              <p className="text-sm font-mono text-text-secondary tracking-wider">{account.accountNumber.replace(/(\d{4})/g, '$1 ').trim()}</p>
              <p className="text-xs text-text-muted mt-0.5">IFSC: {account.ifscCode}</p>
            </div>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-sm text-text-secondary">Available Balance</p>
            <p className="text-3xl font-bold text-text">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-text-muted mt-0.5">{account.currency}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-surface-border">
          <button
            onClick={handleFreezeToggle}
            disabled={actionLoading}
            className={clsx('btn-secondary flex items-center gap-2', isFrozen ? 'text-success-600 border-success-200 hover:bg-success-50' : 'text-warning-600 border-warning-200 hover:bg-warning-50')}
          >
            {actionLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isFrozen ? (
              <Flame className="w-4 h-4" />
            ) : (
              <Snowflake className="w-4 h-4" />
            )}
            {isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Statement
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Info className="w-4 h-4" /> View Details
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base p-6">
        <h2 className="text-base font-semibold text-text mb-4">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wider">Description</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wider">Ref No.</th>
                <th className="text-left py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
                <th className="text-center py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-surface-border last:border-0 hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-2 text-text whitespace-nowrap">{format(new Date(txn.createdAt), 'dd MMM yyyy')}</td>
                    <td className="py-3 px-2">
                      {/* VULNERABILITY: XSS - renders unsanitized user input */}
                      <p className="font-medium text-text" dangerouslySetInnerHTML={{ __html: txn.description }} />
                      <p className="text-xs text-text-muted">{txn.category}</p>
                  </td>
                  <td className="py-3 px-2 text-xs font-mono text-text-secondary">{txn.referenceNumber}</td>
                  <td className="py-3 px-2">
                    <span className="text-xs capitalize text-text-secondary">{txn.type}</span>
                  </td>
                  <td className={clsx('py-3 px-2 text-right font-semibold', txn.type === 'deposit' || txn.type === 'refund' ? 'text-success-600' : 'text-danger-600')}>
                    {txn.type === 'credit' || txn.type === 'deposit' || txn.type === 'refund' ? '+' : '-'}${txn.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center"><StatusBadge status={txn.status} /></td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <FileDown className="w-8 h-8 text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base p-6">
        <h2 className="text-base font-semibold text-text mb-4">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Account Type', value: account.type.charAt(0).toUpperCase() + account.type.slice(1) },
            { label: 'Account Number', value: account.accountNumber.replace(/(\d{4})/g, '$1 ').trim() },
            { label: 'IFSC Code', value: account.ifscCode },
            { label: 'Branch Code', value: account.branchCode },
            { label: 'Currency', value: account.currency },
            { label: 'Status', value: isFrozen ? 'Frozen' : 'Active' },
            { label: 'Opened Date', value: 'January 15, 2023' },
            { label: 'Branch', value: 'NovaBank Main Branch' },
          ].map((detail) => (
            <div key={detail.label} className="p-3 rounded-lg bg-surface border border-surface-border">
              <p className="text-xs text-text-secondary mb-0.5">{detail.label}</p>
              <p className="text-sm font-medium text-text">{detail.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
