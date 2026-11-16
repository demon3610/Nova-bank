import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus, ChevronDown, ChevronUp, Wallet, PiggyBank, Building2,
  RefreshCw, Landmark, Loader2,
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
  active: 'bg-success-50 text-success-600 border-success-200',
  frozen: 'bg-warning-50 text-warning-600 border-warning-200',
  closed: 'bg-danger-50 text-danger-600 border-danger-200',
  dormant: 'bg-surface text-text-muted border-surface-border',
  completed: 'bg-success-50 text-success-600 border-success-200',
  pending: 'bg-warning-50 text-warning-600 border-warning-200',
  failed: 'bg-danger-50 text-danger-600 border-danger-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border', statusColors[status] || 'bg-surface text-text-secondary border-surface-border')}>
      {status}
    </span>
  );
}

function AccountCard({ account, isExpanded, onToggle, transactions = [], onDeposit }: { account: Account; isExpanded: boolean; onToggle: () => void; transactions?: Transaction[]; onDeposit?: (account: Account) => void }) {
  const Icon = account.type === 'savings' ? PiggyBank : Wallet;

  return (
    <motion.div variants={itemVariants} layout className="card-base overflow-hidden">
      <button onClick={onToggle} className="w-full p-6 text-left hover:bg-surface/50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              account.type === 'savings' ? 'bg-success-50' : 'bg-primary-50',
            )}>
              <Icon className={clsx('w-6 h-6', account.type === 'savings' ? 'text-success-600' : 'text-primary-600')} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-text capitalize">{account.type} Account</h3>
                <StatusBadge status={account.status} />
              </div>
              <p className="text-sm font-mono text-text-secondary tracking-wider">{account.accountNumber.replace(/(\d{4})/g, '$1 ').trim()}</p>
              <p className="text-xs text-text-muted mt-0.5">IFSC: {account.ifscCode}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-2xl font-bold text-text">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-text-muted mt-0.5">{account.currency}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-border">
          <button
            onClick={(e) => { e.stopPropagation(); onDeposit?.(account); }}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <Landmark className="w-3.5 h-3.5" /> Deposit
          </button>
          <span className="text-xs text-text-secondary flex items-center gap-1">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {isExpanded ? 'Hide Mini Statement' : 'View Mini Statement'}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-surface-border"
          >
            <div className="p-6 bg-surface/30">
              <h4 className="text-sm font-semibold text-text mb-3">Recent Transactions</h4>
              {transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-card border border-surface-border">
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="text-sm font-medium text-text truncate">{txn.description}</p>
                        <p className="text-xs text-text-muted">{format(new Date(txn.createdAt), 'dd MMM yyyy')}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={clsx('text-sm font-semibold', txn.amount > 0 ? 'text-success-600' : 'text-danger-600')}>
                          {txn.type === 'credit' || txn.type === 'deposit' || txn.type === 'refund' ? '+' : '-'}${txn.amount.toLocaleString()}
                        </p>
                        <StatusBadge status={txn.status} />
                      </div>
                    </div>
                  ))}
                  <Link
                    to={`/dashboard/accounts/${account.id}`}
                    className="block text-center text-xs text-primary-600 hover:underline py-2"
                  >
                    View Full Statement →
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-4">No transactions yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AccountsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [statements, setStatements] = useState<Record<string, Transaction[]>>({});
  const [selectedType, setSelectedType] = useState<'savings' | 'current' | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [depositingAccount, setDepositingAccount] = useState<Account | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await accountService.getAccounts();
      if (res.data) setAccounts(res.data);
    } catch {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!statements[id]) {
      try {
        const res = await transactionService.getTransactions({ accountId: id });
        if (res.data) setStatements((prev) => ({ ...prev, [id]: res.data }));
      } catch {
        toast.error('Failed to load transactions');
      }
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Accounts</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Total Balance: <span className="font-semibold text-text">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Open New Account
        </button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              isExpanded={expandedId === account.id}
              onToggle={() => toggleExpand(account.id)}
              transactions={statements[account.id] || []}
              onDeposit={(acc) => setDepositingAccount(acc)}
            />
          ))}
          {accounts.length === 0 && (
            <motion.div variants={itemVariants} className="card-base p-12 text-center">
              <Building2 className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <h3 className="text-base font-semibold text-text mb-1">No Accounts Yet</h3>
              <p className="text-sm text-text-muted mb-4">Open your first account to get started with NovaBank.</p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" /> Open New Account
              </button>
            </motion.div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-base p-6 w-full max-w-md"
            >
              <h2 className="text-lg font-semibold text-text mb-4">Open New Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['savings', 'current'] as const).map((type) => (
                      <button
                        key={type}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                          selectedType === type
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                            : 'border-surface-border hover:border-primary-300 hover:bg-primary-50'
                        }`}
                        onClick={() => setSelectedType(type)}
                      >
                        {type === 'savings' ? <PiggyBank className="w-8 h-8 text-success-600" /> : <Wallet className="w-8 h-8 text-primary-600" />}
                        <span className="text-sm font-medium text-text capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Currency</label>
                  <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} className="input-base">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowCreateModal(false); setSelectedType(null); }} className="btn-secondary flex-1">Cancel</button>
                  <button
                    disabled={creating || !selectedType}
                    onClick={async () => {
                      if (!selectedType) return;
                      setCreating(true);
                      try {
                        await accountService.createAccount(selectedType, selectedCurrency);
                        toast.success('Account created successfully');
                        setShowCreateModal(false);
                        setSelectedType(null);
                        fetchAccounts();
                      } catch {
                        toast.error('Failed to create account');
                      } finally {
                        setCreating(false);
                      }
                    }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {creating && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {creating ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {depositingAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => { if (!depositing) setDepositingAccount(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-base p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-semibold text-text mb-1">Deposit Funds</h2>
              <p className="text-sm text-text-muted mb-4">
                {depositingAccount.type} Account • {depositingAccount.accountNumber.replace(/(\d{4})/g, '$1 ').trim()}
              </p>
              <p className="text-sm text-text mb-2">Current Balance: <span className="font-semibold">${depositingAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Amount</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="input-base"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setDepositingAccount(null); setDepositAmount(''); }}
                    disabled={depositing}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={depositing || !depositAmount || parseFloat(depositAmount) <= 0}
                    onClick={async () => {
                      const amount = parseFloat(depositAmount);
                      if (!amount || amount <= 0) return;
                      setDepositing(true);
                      try {
                        await accountService.deposit(depositingAccount.id, amount);
                        toast.success('Deposit successful');
                        setDepositingAccount(null);
                        setDepositAmount('');
                        fetchAccounts();
                      } catch {
                        toast.error('Failed to deposit');
                      } finally {
                        setDepositing(false);
                      }
                    }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {depositing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {depositing ? 'Processing...' : 'Deposit'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
