import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import DataTable, { type Column } from '@/components/common/DataTable';
import type { User, KycStatus } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const mockUsers: (User & { avatar?: string; accountsCount: number })[] = [
  { id: 'u1', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.sharma@email.com', phone: '+91-98765-43210', kycStatus: 'verified', isActive: true, roles: ['customer'], createdAt: '2023-06-15T10:00:00Z', accountsCount: 2 },
  { id: 'u2', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@email.com', phone: '+91-98765-43211', kycStatus: 'verified', isActive: true, roles: ['customer'], createdAt: '2023-07-20T08:30:00Z', accountsCount: 1 },
  { id: 'u3', firstName: 'Amit', lastName: 'Singh', email: 'amit.singh@email.com', phone: '+91-98765-43212', kycStatus: 'pending', isActive: true, roles: ['customer'], createdAt: '2023-09-10T14:15:00Z', accountsCount: 0 },
  { id: 'u4', firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.reddy@email.com', phone: '+91-98765-43213', kycStatus: 'verified', isActive: false, roles: ['customer'], createdAt: '2023-04-05T11:45:00Z', accountsCount: 1 },
  { id: 'u5', firstName: 'Vikram', lastName: 'Joshi', email: 'vikram.joshi@email.com', phone: '+91-98765-43214', kycStatus: 'rejected', isActive: true, roles: ['customer'], createdAt: '2024-01-02T09:00:00Z', accountsCount: 0 },
  { id: 'u6', firstName: 'Ananya', lastName: 'Singh', email: 'ananya.singh@email.com', phone: '+91-98765-43215', kycStatus: 'not_started', isActive: true, roles: ['customer'], createdAt: '2024-02-18T16:30:00Z', accountsCount: 1 },
  { id: 'u7', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@bank.com', phone: '+91-98765-43216', kycStatus: 'verified', isActive: true, roles: ['employee'], createdAt: '2022-11-01T07:00:00Z', accountsCount: 0 },
  { id: 'u8', firstName: 'Neha', lastName: 'Gupta', email: 'neha.gupta@bank.com', phone: '+91-98765-43217', kycStatus: 'verified', isActive: true, roles: ['employee', 'manager'], createdAt: '2023-01-10T08:00:00Z', accountsCount: 0 },
];

const kycVariant: Record<KycStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  verified: 'success',
  pending: 'warning',
  rejected: 'danger',
  not_started: 'neutral',
};

const getInitials = (first: string, last: string) => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [users, setUsers] = useState(mockUsers);

  const filtered = useMemo(() => {
    let result = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q),
      );
    }
    if (statusFilter === 'active') result = result.filter((u) => u.isActive);
    if (statusFilter === 'inactive') result = result.filter((u) => !u.isActive);
    if (kycFilter !== 'all') result = result.filter((u) => u.kycStatus === kycFilter);
    return result;
  }, [search, statusFilter, kycFilter, users]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)));
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'select',
      label: '',
      render: (user: Record<string, unknown>) => {
        const u = user as unknown as User;
        return (
        <input
          type="checkbox"
          checked={selectedUsers.has(u.id)}
          onChange={() => toggleSelect(u.id)}
          className="w-3.5 h-3.5 rounded border-surface-border text-primary-600 focus:ring-primary-500"
        />
      );},
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (user: Record<string, unknown>) => {
        const u = user as unknown as User;
        return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
            {getInitials(u.firstName, u.lastName)}
          </div>
          <div>
            <p className="text-sm font-medium text-text">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-text-muted">{u.email}</p>
          </div>
        </div>
      );},
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      render: (user: Record<string, unknown>) => {
        const u = user as unknown as User;
        return <span className="text-sm text-text-secondary">{u.phone}</span>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (user: Record<string, unknown>) => {
        const u = user as unknown as User;
        return (
        <button
          onClick={(e) => { e.stopPropagation(); toggleUserStatus(u.id); }}
          className={clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
            u.isActive
              ? 'bg-success-50 text-success-700 border-success-200'
              : 'bg-surface text-text-muted border-surface-border',
          )}
        >
          {u.isActive ? 'Active' : 'Inactive'}
        </button>
      );},
    },
    {
      key: 'kyc',
      label: 'KYC Status',
      sortable: true,
      render: (user: Record<string, unknown>) => {
        const u = user as unknown as User;
        return <StatusBadge variant={kycVariant[u.kycStatus]} size="sm">{u.kycStatus.replace('_', ' ')}</StatusBadge>;
      },
    },
    {
      key: 'accountsCount',
      label: 'Accounts',
      sortable: true,
      render: (user: Record<string, unknown>) => {
        return <span className="text-sm text-text">{String(user.accountsCount ?? '')}</span>;
      },
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (user: Record<string, unknown>) => {
        const u = user as unknown as User;
        return <span className="text-sm text-text-secondary">{format(new Date(u.createdAt), 'dd MMM yyyy')}</span>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: (user: Record<string, unknown>) => {
        const u = user as unknown as User;
        return (
        <div className="flex items-center justify-end gap-1">
          <button className="p-1.5 rounded-button text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors" title="View">
            View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleUserStatus(u.id); }}
            className={clsx(
              'p-1.5 rounded-button text-xs font-medium transition-colors',
              u.isActive
                ? 'text-warning-600 hover:bg-warning-50'
                : 'text-success-600 hover:bg-success-50',
            )}
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }}
            className="p-1.5 rounded-button text-xs font-medium text-danger-600 hover:bg-danger-50 transition-colors"
          >
            Delete
          </button>
        </div>
      );},
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text">User Management</h1>
        <p className="text-sm text-text-secondary mt-0.5">Manage all registered users, their status, and KYC details.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9"
            />
          </div>
          <Button variant="secondary" iconLeft={<Download className="w-4 h-4" />}>Export</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-text-muted" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base w-auto py-1.5 text-xs">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={kycFilter} onChange={(e) => setKycFilter(e.target.value)} className="input-base w-auto py-1.5 text-xs">
            <option value="all">All KYC</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="not_started">Not Started</option>
          </select>
          <span className="text-xs text-text-muted">{filtered.length} users</span>
        </div>
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 border border-primary-200">
            <span className="text-xs font-medium text-primary-700">{selectedUsers.size} selected</span>
            <Button size="sm" variant="secondary">Bulk Activate</Button>
            <Button size="sm" variant="secondary">Bulk Deactivate</Button>
            <Button size="sm" variant="danger" onClick={() => setSelectedUsers(new Set())}>Clear Selection</Button>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="card-base overflow-hidden">
        <DataTable
          columns={columns}
          data={paginated as any}
          keyExtractor={(u: any) => u.id}
          sortable
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border bg-surface/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Rows per page:</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="input-base w-auto py-1 text-xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Page {page} of {totalPages || 1}</span>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 text-xs rounded-button border border-surface-border bg-white text-text disabled:opacity-40 hover:bg-surface transition-colors"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 text-xs rounded-button border border-surface-border bg-white text-text disabled:opacity-40 hover:bg-surface transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {deleteTarget && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Are you sure you want to permanently delete <strong className="text-text">{deleteTarget.firstName} {deleteTarget.lastName}</strong>?
            </p>
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-200">
              <p className="text-xs text-danger-700">This action cannot be undone. All associated data will be permanently removed.</p>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
