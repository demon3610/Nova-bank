import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Users, Building2, Activity, AlertTriangle, Server, Database, HardDrive, Bell, Shield, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KpiCard from '@/components/common/KpiCard';

const kpiData = [
  { label: 'Total Users', value: '12,847', change: 12.5, changeType: 'increase' as const, icon: Users },
  { label: 'Active Accounts', value: '18,432', change: 8.2, changeType: 'increase' as const, icon: Building2 },
  { label: 'Total Employees', value: '234', change: 3.1, changeType: 'increase' as const, icon: Activity },
  { label: 'Pending Actions', value: '47', change: 5.3, changeType: 'decrease' as const, icon: AlertTriangle },
];

const chartData = [
  { date: '01 Jun', users: 1200 }, { date: '02 Jun', users: 1350 }, { date: '03 Jun', users: 1100 }, { date: '04 Jun', users: 1480 },
  { date: '05 Jun', users: 1320 }, { date: '06 Jun', users: 1550 }, { date: '07 Jun', users: 1420 }, { date: '08 Jun', users: 1680 },
  { date: '09 Jun', users: 1590 }, { date: '10 Jun', users: 1750 }, { date: '11 Jun', users: 1620 }, { date: '12 Jun', users: 1890 },
  { date: '13 Jun', users: 1720 }, { date: '14 Jun', users: 1950 }, { date: '15 Jun', users: 1880 },
];

const auditEntries = [
  { time: '2 min ago', actor: 'System', action: 'Backup completed', severity: 'low' },
  { time: '15 min ago', actor: 'Admin Raj', action: 'User account activated', severity: 'medium' },
  { time: '1 hour ago', actor: 'System', action: 'Failed login attempt alert', severity: 'high' },
  { time: '2 hours ago', actor: 'Admin Raj', action: 'Role permissions updated', severity: 'medium' },
  { time: '3 hours ago', actor: 'System', action: 'Database optimization', severity: 'low' },
];

const systemHealth = [
  { name: 'API Server', status: 'healthy', icon: Server },
  { name: 'Database', status: 'healthy', icon: Database },
  { name: 'Redis Cache', status: 'healthy', icon: HardDrive },
  { name: 'Queue Worker', status: 'degraded', icon: RefreshCw },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-text">Admin Dashboard</h1>
        <p className="text-text-secondary mt-1">System overview and management</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-surface-card rounded-card shadow-card border border-surface-border p-6">
          <h2 className="text-lg font-semibold text-text mb-4">User Registration (Last 15 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }} />
                <Area type="monotone" dataKey="users" stroke="#0F4C81" strokeWidth={2} fillOpacity={1} fill="url(#userGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
          <div className="bg-surface-card rounded-card shadow-card border border-surface-border p-5">
            <h2 className="text-sm font-semibold text-text mb-4">System Health</h2>
            <div className="space-y-3">
              {systemHealth.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm text-text">{s.name}</span>
                    </div>
                    <span className={clsx('w-2 h-2 rounded-full', s.status === 'healthy' ? 'bg-success-500' : 'bg-warning-500')} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-card rounded-card shadow-card border border-surface-border p-5">
            <h2 className="text-sm font-semibold text-text mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full py-2 px-3 rounded-button bg-surface text-text text-sm font-medium hover:bg-surface-border transition-colors flex items-center gap-2"><Bell className="w-4 h-4" />Send Notification</button>
              <button className="w-full py-2 px-3 rounded-button bg-surface text-text text-sm font-medium hover:bg-surface-border transition-colors flex items-center gap-2"><Shield className="w-4 h-4" />Run Security Scan</button>
              <button className="w-full py-2 px-3 rounded-button bg-surface text-text text-sm font-medium hover:bg-surface-border transition-colors flex items-center gap-2"><Activity className="w-4 h-4" />Generate Report</button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface-card rounded-card shadow-card border border-surface-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Recent Audit Logs</h2>
          <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs uppercase tracking-wider border-b border-surface-border">
                <th className="text-left py-3 px-2 font-medium">Time</th>
                <th className="text-left py-3 px-2 font-medium">Actor</th>
                <th className="text-left py-3 px-2 font-medium">Action</th>
                <th className="text-left py-3 px-2 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {auditEntries.map((entry, i) => (
                <tr key={i} className="border-b border-surface-border/50 hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-2 text-text-secondary">{entry.time}</td>
                  <td className="py-3 px-2 font-medium text-text">{entry.actor}</td>
                  <td className="py-3 px-2 text-text-secondary">{entry.action}</td>
                  <td className="py-3 px-2">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                      entry.severity === 'low' && 'bg-surface-border text-text-secondary',
                      entry.severity === 'medium' && 'bg-warning-50 text-warning-600',
                      entry.severity === 'high' && 'bg-danger-50 text-danger-600',
                    )}>{entry.severity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

