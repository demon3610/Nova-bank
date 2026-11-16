import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, FileCheck, AlertTriangle, Snowflake,
  CheckCircle, ArrowRight, Activity,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const kpis = [
  { label: 'Pending KYC Reviews', value: 12, change: 3, changeType: 'increase', icon: FileCheck, color: 'bg-warning-50 text-warning-600' },
  { label: 'Flagged Transactions', value: 5, change: 2, changeType: 'increase', icon: AlertTriangle, color: 'bg-danger-50 text-danger-600' },
  { label: 'Frozen Accounts', value: 8, change: 1, changeType: 'decrease', icon: Snowflake, color: 'bg-blue-50 text-blue-600' },
  { label: "Today's Actions", value: 24, change: 7, changeType: 'increase', icon: Activity, color: 'bg-success-50 text-success-600' },
];

const pendingReviews = [
  { id: 'r1', name: 'Rahul Sharma', type: 'KYC', status: 'pending', submittedAt: new Date(Date.now() - 7200000).toISOString(), priority: 'high' },
  { id: 'r2', name: 'Priya Patel', type: 'KYC', status: 'pending', submittedAt: new Date(Date.now() - 14400000).toISOString(), priority: 'medium' },
  { id: 'r3', name: 'Amit Singh', type: 'Card Application', status: 'pending', submittedAt: new Date(Date.now() - 28800000).toISOString(), priority: 'low' },
  { id: 'r4', name: 'Sneha Reddy', type: 'KYC', status: 'pending', submittedAt: new Date(Date.now() - 36000000).toISOString(), priority: 'high' },
  { id: 'r5', name: 'Vikram Joshi', type: 'Account Freeze Request', status: 'pending', submittedAt: new Date(Date.now() - 43200000).toISOString(), priority: 'urgent' },
];

const recentActions = [
  { id: 'a1', action: 'Account activated', target: 'Neha Gupta', by: 'You', time: new Date(Date.now() - 1800000).toISOString() },
  { id: 'a2', action: 'Card frozen', target: '****7890', by: 'You', time: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a3', action: 'KYC verified', target: 'Raj Kumar', by: 'Rajesh', time: new Date(Date.now() - 7200000).toISOString() },
  { id: 'a4', action: 'Transaction flagged', target: '$5,000 transfer', by: 'System', time: new Date(Date.now() - 10800000).toISOString() },
  { id: 'a5', action: 'Beneficiary added', target: 'Ananya Singh', by: 'You', time: new Date(Date.now() - 14400000).toISOString() },
];

const priorityColors: Record<string, string> = {
  urgent: 'bg-danger-50 text-danger-600 border-danger-200',
  high: 'bg-warning-50 text-warning-600 border-warning-200',
  medium: 'bg-primary-50 text-primary-600 border-primary-200',
  low: 'bg-surface text-text-muted border-surface-border',
};

export default function EmployeeDashboard() {
  const [lookupQuery, setLookupQuery] = useState('');

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text">Employee Dashboard</h1>
        <p className="text-sm text-text-secondary mt-0.5">Welcome back! Here's your operations overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <motion.div key={kpi.label} variants={itemVariants} className="card-base p-5 hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', kpi.color)}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full', kpi.changeType === 'increase' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600')}>
                {kpi.changeType === 'increase' ? '+' : '-'}{kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-text">{kpi.value}</p>
            <p className="text-sm text-text-secondary mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="card-base p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Search className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-base font-semibold text-text">Quick Customer Lookup</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by account number, phone, email..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="input-base pl-9"
            />
          </div>
          <Link to="/employee/customers" className="btn-primary flex items-center gap-2">
            Advanced Search <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text">Pending Reviews</h2>
            <Link to="/employee/customers" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {pendingReviews.slice(0, 5).map((review) => (
              <div key={review.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border hover:border-emerald-200 transition-colors cursor-pointer">
                <div className="min-w-0 flex-1 mr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-text truncate">{review.name}</p>
                    <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-full border', priorityColors[review.priority])}>
                      {review.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{review.type}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(review.submittedAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <button className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                  Review <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
            {pendingReviews.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">All reviews completed</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text">Recent Actions</h2>
          </div>
          <div className="space-y-2">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-text truncate">{action.action}</p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{action.target}</span>
                    <span>·</span>
                    <span>by {action.by}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(action.time), { addSuffix: true })}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
