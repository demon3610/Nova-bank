import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Shield, Mail, Phone, CreditCard, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import clsx from 'clsx';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  isActive: boolean;
  accountCount: number;
  createdAt: string;
}

const mockCustomers: Customer[] = [
  { id: '1', firstName: 'Rajesh', lastName: 'Sharma', email: 'rajesh.sharma@email.com', phone: '+91-9876543210', kycStatus: 'verified', isActive: true, accountCount: 2, createdAt: '2024-01-15' },
  { id: '2', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@email.com', phone: '+91-9876543211', kycStatus: 'pending', isActive: true, accountCount: 1, createdAt: '2024-03-20' },
  { id: '3', firstName: 'Amit', lastName: 'Verma', email: 'amit.verma@email.com', phone: '+91-9876543212', kycStatus: 'rejected', isActive: false, accountCount: 0, createdAt: '2024-02-10' },
];

export default function CustomerLookup() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState<'name' | 'email' | 'phone' | 'account'>('name');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = mockCustomers.filter(c => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    switch (searchBy) {
      case 'name': return `${c.firstName} ${c.lastName}`.toLowerCase().includes(q);
      case 'email': return c.email.toLowerCase().includes(q);
      case 'phone': return c.phone.includes(q);
      default: return true;
    }
  });

  const kycBadge = (status: Customer['kycStatus']) => {
    const styles = {
      verified: 'bg-success-50 text-success-600 border-success-200',
      pending: 'bg-warning-50 text-warning-600 border-warning-200',
      rejected: 'bg-danger-50 text-danger-600 border-danger-200',
    };
    const icons = {
      verified: CheckCircle,
      pending: AlertTriangle,
      rejected: XCircle,
    };
    const Icon = icons[status];
    return (
      <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', styles[status])}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Customer Lookup</h1>
          <p className="text-text-secondary mt-1">Search and manage customer profiles</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface-card rounded-card shadow-card border border-surface-border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder={`Search by ${searchBy}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-button border border-surface-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(['name', 'email', 'phone', 'account'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setSearchBy(opt)}
                className={clsx(
                  'px-4 py-2 rounded-button text-sm font-medium transition-colors capitalize',
                  searchBy === opt
                    ? 'bg-primary-800 text-white'
                    : 'bg-surface text-text-secondary border border-surface-border hover:bg-surface-border'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={clsx('lg:col-span-2 space-y-3', selectedCustomer && 'hidden lg:block')}>
          {!searchQuery ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-card rounded-card shadow-card border border-surface-border p-12 text-center">
              <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">Enter a search query to find customers</p>
            </motion.div>
          ) : filteredCustomers.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-card rounded-card shadow-card border border-surface-border p-12 text-center">
              <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">No customers found matching your search</p>
            </motion.div>
          ) : (
            filteredCustomers.map((customer, idx) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedCustomer(customer)}
                className={clsx(
                  'bg-surface-card rounded-card shadow-card border border-surface-border p-5 cursor-pointer transition-all hover:shadow-card-hover',
                  selectedCustomer?.id === customer.id && 'ring-2 ring-primary-500'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-800 font-semibold text-sm">
                    {customer.firstName[0]}{customer.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text">{customer.firstName} {customer.lastName}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{customer.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{customer.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {kycBadge(customer.kycStatus)}
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', customer.isActive ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600')}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <CreditCard className="w-3.5 h-3.5" />
                      {customer.accountCount} accounts
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-surface-card rounded-card shadow-card border border-surface-border p-6 h-fit"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text">Customer Details</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-text-muted hover:text-text transition-colors"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-800 font-semibold text-xl mx-auto mb-3">
                {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
              </div>
              <p className="font-semibold text-text">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
              <p className="text-sm text-text-secondary">{selectedCustomer.email}</p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Phone</span><span className="text-text font-medium">{selectedCustomer.phone}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">KYC Status</span>{kycBadge(selectedCustomer.kycStatus)}</div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Status</span><span className={clsx('font-medium', selectedCustomer.isActive ? 'text-success-600' : 'text-danger-600')}>{selectedCustomer.isActive ? 'Active' : 'Inactive'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Accounts</span><span className="text-text font-medium">{selectedCustomer.accountCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Customer Since</span><span className="text-text font-medium">{selectedCustomer.createdAt}</span></div>
            </div>
            <div className="space-y-2">
              <button className="w-full py-2 rounded-button bg-primary-800 text-white text-sm font-medium hover:bg-primary-900 transition-colors flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" /> View Full Profile
              </button>
              <button className="w-full py-2 rounded-button bg-danger-50 text-danger-600 text-sm font-medium hover:bg-danger-100 transition-colors flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Freeze All Accounts
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
