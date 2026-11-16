import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Eye, EyeOff, TrendingUp, TrendingDown, Wallet, ArrowUpRight,
  Send, Receipt, UserPlus, CreditCard, Bell,
  ArrowRight, Target, Settings as SettingsIcon, FileText, Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { Account, Transaction, Card, Notification as NotificationType } from '@/types';
import toast from 'react-hot-toast';
import { accountService } from '@/services/account.service';
import { transactionService } from '@/services/transaction.service';
import { cardService } from '@/services/card.service';
import { notificationService } from '@/services/notification.service';
import { useAuthStore } from '@/store/authStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};



const notificationIcons: Record<string, React.ElementType> = {
  transaction: ArrowUpRight, security: CreditCard, account: Wallet, promotion: Bell, system: SettingsIcon, kyc: UserPlus,
};

const statusColors: Record<string, string> = {
  completed: 'bg-success-50 text-success-600 border-success-200',
  pending: 'bg-warning-50 text-warning-600 border-warning-200',
  failed: 'bg-danger-50 text-danger-600 border-danger-200',
  cancelled: 'bg-surface-border text-text-muted border-surface-border',
  processing: 'bg-primary-50 text-primary-600 border-primary-200',
  active: 'bg-success-50 text-success-600 border-success-200',
  frozen: 'bg-warning-50 text-warning-600 border-warning-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border', statusColors[status] || 'bg-surface text-text-secondary border-surface-border')}>
      {status}
    </span>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function KpiCard({
  label, value, change, changeType, icon: Icon, isHidden, onToggle,
}: {
  label: string; value: number; change: number; changeType: string; icon: React.ElementType;
  isHidden?: boolean; onToggle?: () => void;
}) {
  const isSavings = label === 'Savings Goal';
  const formattedValue = isSavings ? `${value}%` : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const displayValue = isHidden && !isSavings ? '*****' : formattedValue;

  return (
    <motion.div variants={itemVariants} className="card-base p-6 relative overflow-hidden group hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex items-center gap-1.5">
          {!isSavings && label === 'Total Balance' && onToggle && (
            <button onClick={onToggle} className="p-1 rounded-md hover:bg-surface transition-colors">
              {isHidden ? <EyeOff className="w-4 h-4 text-text-muted" /> : <Eye className="w-4 h-4 text-text-muted" />}
            </button>
          )}
          <span className={clsx(
            'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full',
            changeType === 'increase' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600',
          )}>
            {changeType === 'increase' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}%
          </span>
        </div>
      </div>
      <p className="text-sm text-text-secondary mb-1">{label}</p>
      {isSavings ? (
        <div className="mt-2">
          <p className="text-2xl font-bold text-text">{displayValue}</p>
          <div className="mt-2 w-full h-2 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full transition-all duration-500" style={{ width: `${value}%` }} />
          </div>
          <p className="text-xs text-text-muted mt-1">
            <TrendingUp className="w-3 h-3 inline mr-0.5 text-success-500" />
            {change}% from last month
          </p>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-text">{displayValue}</p>
          <p className="text-xs text-text-muted mt-1">
            {changeType === 'increase' ? '+' : '-'}{change}% from last month
          </p>
        </>
      )}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [aRes, tRes, cRes, nRes] = await Promise.allSettled([
        accountService.getAccounts(),
        transactionService.getTransactions(),
        cardService.getCards(),
        notificationService.getNotifications(),
      ]);
      let hasError = false;
      if (aRes.status === 'fulfilled' && aRes.value.data) setAccounts(aRes.value.data); else hasError = true;
      if (tRes.status === 'fulfilled' && tRes.value.data) setTransactions(tRes.value.data); else hasError = true;
      if (cRes.status === 'fulfilled' && cRes.value.data) setCards(cRes.value.data); else hasError = true;
      if (nRes.status === 'fulfilled' && nRes.value.data?.notifications) setNotifications(nRes.value.data.notifications); else hasError = true;
      if (hasError) toast.error('Some dashboard data failed to load');
      setLoading(false);
    };
    fetchData();
  }, []);

  const { user } = useAuthStore();
  const userName = user?.firstName || 'User';
  const now = new Date();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentTxns = transactions.filter((t) => new Date(t.createdAt) >= thirtyDaysAgo);
  const monthlyIncome = recentTxns
    .filter((t) => t.type === 'credit' || t.type === 'deposit' || t.type === 'refund' || t.type === 'interest')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = recentTxns
    .filter((t) => t.type === 'payment' || t.type === 'withdrawal' || t.type === 'fee' || t.type === 'transfer')
    .reduce((sum, t) => sum + t.amount, 0);
  const savingsProgress = totalBalance > 0 ? Math.min(Math.round((totalBalance / 100000) * 100), 100) : 0;

  const kpis = [
    { label: 'Total Balance', value: totalBalance, change: 0, changeType: 'increase' as const, icon: Wallet },
    { label: 'Monthly Income', value: monthlyIncome, change: 0, changeType: 'increase' as const, icon: TrendingUp },
    { label: 'Monthly Expenses', value: monthlyExpenses, change: 0, changeType: 'decrease' as const, icon: TrendingDown },
    { label: 'Savings Goal', value: savingsProgress, change: 0, changeType: 'increase' as const, icon: Target },
  ];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyAgg = transactions.reduce<Record<string, number>>((acc, t) => {
    const m = monthNames[new Date(t.createdAt).getMonth()];
    acc[m] = (acc[m] || 0) + t.amount;
    return acc;
  }, {});
  const spendingData = monthNames.map((month) => ({ month, spending: monthlyAgg[month] || 0 }));

  const spendingTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-surface-card border border-surface-border shadow-dropdown rounded-button px-3 py-2 text-xs">
          <p className="text-text-secondary mb-0.5">{label}</p>
          <p className="font-semibold text-text">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-text">{getGreeting()}, {userName}</h1>
          <p className="text-sm text-text-secondary mt-0.5">{format(now, 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            {...kpi}
            isHidden={balanceHidden && kpi.label === 'Total Balance'}
            onToggle={kpi.label === 'Total Balance' ? () => setBalanceHidden(!balanceHidden) : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card-base lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text">Spending Overview</h2>
            <Link to="/dashboard/transactions" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={spendingTooltip} cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="spending" stroke="#2563EB" strokeWidth={2} fill="url(#spendingGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text">Recent Transactions</h2>
            <Link to="/dashboard/transactions" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-text truncate">{txn.description}</p>
                  <p className="text-xs text-text-muted mt-0.5">{formatDistanceToNow(new Date(txn.createdAt), { addSuffix: true })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={clsx('text-sm font-semibold', txn.amount > 0 ? 'text-success-600' : 'text-danger-600')}>
                    {txn.type === 'credit' || txn.type === 'refund' || txn.type === 'deposit' ? '+' : '-'}${txn.amount.toLocaleString()}
                  </p>
                  <StatusBadge status={txn.status} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text">Active Cards</h2>
            <Link to="/dashboard/cards" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {cards.slice(0, 2).map((card) => (
              <div key={card.id} className="p-4 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-white/5" />
                <div className="absolute bottom-0 left-0 w-16 h-16 -ml-4 -mb-4 rounded-full bg-white/5" />
                <div className="flex items-center justify-between mb-3 relative">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{card.network}</span>
                  <span className={clsx(
                    'px-1.5 py-0.5 rounded text-[9px] font-medium uppercase',
                    card.type === 'debit' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                  )}>{card.type}</span>
                </div>
                <p className="text-base font-mono text-white tracking-[0.15em] relative">
                  **** **** **** {card.cardNumber.slice(-4)}
                </p>
                <div className="flex items-center justify-between mt-3 relative">
                  <p className="text-[10px] text-gray-400 font-mono">
                    {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear.toString().slice(-2)}
                  </p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">{card.cardholderName}</p>
                </div>
              </div>
            ))}
            {cards.length === 0 && (
              <div className="text-center py-6">
                <CreditCard className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No cards yet</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-base p-6">
          <h2 className="text-base font-semibold text-text mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Send, label: 'Transfer Money', to: '/dashboard/transfer', color: 'text-primary-600 bg-primary-50' },
              { icon: Zap, label: 'Fast Transfer', to: '/dashboard/transfer?fast=true', color: 'text-warning-600 bg-warning-50' },
              { icon: FileText, label: 'PDF Statement', to: '/api/statements/pdf', color: 'text-indigo-600 bg-indigo-50', external: true },
              { icon: Receipt, label: 'Pay Bills', to: '/dashboard/transactions', color: 'text-success-600 bg-success-50' },
              { icon: UserPlus, label: 'Add Beneficiary', to: '/dashboard/beneficiaries', color: 'text-amber-600 bg-amber-50' },
              { icon: CreditCard, label: 'Freeze Card', to: '/dashboard/cards', color: 'text-danger-600 bg-danger-50' },
            ].map((action) => (
              action.external ? (
                <a
                  key={action.label}
                  href={action.to}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-3.5 rounded-lg border border-surface-border hover:shadow-card-hover hover:border-primary-200 transition-all duration-200 group"
                >
                  <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center transition-colors', action.color)}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-text text-center">{action.label}</span>
                </a>
              ) : (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-lg border border-surface-border hover:shadow-card-hover hover:border-primary-200 transition-all duration-200 group"
                >
                  <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center transition-colors', action.color)}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-text text-center">{action.label}</span>
                </Link>
              )
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text">Notifications</h2>
            <Link to="/dashboard/notifications" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif) => {
              const Icon = notificationIcons[notif.type] || Bell;
              return (
                <div key={notif.id} className="flex items-start gap-3 py-2 border-b border-surface-border last:border-0">
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    notif.type === 'transaction' ? 'bg-success-50 text-success-600' :
                    notif.type === 'security' ? 'bg-warning-50 text-warning-600' :
                    notif.type === 'system' ? 'bg-primary-50 text-primary-600' : 'bg-surface text-text-secondary',
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text truncate">{notif.title}</p>
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-text-muted truncate">{notif.message}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="text-center py-6">
                <Bell className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No notifications</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

