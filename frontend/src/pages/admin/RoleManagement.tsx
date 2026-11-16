import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Plus, Users, Lock, CheckSquare, Square, Save,
} from 'lucide-react';
import clsx from 'clsx';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Permission {
  id: string;
  label: string;
  key: string;
}

interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  permissions: string[];
}

const permissionGroups: PermissionGroup[] = [
  {
    name: 'User Management',
    permissions: [
      { id: 'p1', label: 'View Users', key: 'users.view' },
      { id: 'p2', label: 'Create Users', key: 'users.create' },
      { id: 'p3', label: 'Edit Users', key: 'users.edit' },
      { id: 'p4', label: 'Delete Users', key: 'users.delete' },
    ],
  },
  {
    name: 'Transactions',
    permissions: [
      { id: 'p5', label: 'View Transactions', key: 'transactions.view' },
      { id: 'p6', label: 'Approve Transactions', key: 'transactions.approve' },
      { id: 'p7', label: 'Reverse Transactions', key: 'transactions.reverse' },
    ],
  },
  {
    name: 'Cards',
    permissions: [
      { id: 'p8', label: 'View Cards', key: 'cards.view' },
      { id: 'p9', label: 'Freeze/Unfreeze', key: 'cards.freeze' },
      { id: 'p10', label: 'Issue Cards', key: 'cards.issue' },
      { id: 'p11', label: 'Cancel Cards', key: 'cards.cancel' },
    ],
  },
  {
    name: 'KYC & Compliance',
    permissions: [
      { id: 'p12', label: 'View KYC Data', key: 'kyc.view' },
      { id: 'p13', label: 'Verify KYC', key: 'kyc.verify' },
      { id: 'p14', label: 'Flag Accounts', key: 'compliance.flag' },
    ],
  },
  {
    name: 'System',
    permissions: [
      { id: 'p15', label: 'View Audit Logs', key: 'audit.view' },
      { id: 'p16', label: 'Manage Roles', key: 'roles.manage' },
      { id: 'p17', label: 'System Configuration', key: 'system.config' },
    ],
  },
];

const mockRoles: Role[] = [
  {
    id: 'r1', name: 'Super Admin', description: 'Full system access with all permissions', userCount: 2, isSystem: true,
    permissions: permissionGroups.flatMap((g) => g.permissions.map((p) => p.key)),
  },
  {
    id: 'r2', name: 'Admin', description: 'Administrative access excluding system config', userCount: 5, isSystem: true,
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'transactions.view', 'transactions.approve', 'cards.view', 'cards.freeze', 'kyc.view', 'kyc.verify', 'audit.view'],
  },
  {
    id: 'r3', name: 'Employee', description: 'Standard employee operations', userCount: 24, isSystem: true,
    permissions: ['users.view', 'transactions.view', 'cards.view', 'cards.freeze', 'kyc.view', 'kyc.verify'],
  },
  {
    id: 'r4', name: 'Compliance Officer', description: 'KYC verification and compliance monitoring', userCount: 8, isSystem: true,
    permissions: ['users.view', 'transactions.view', 'transactions.approve', 'transactions.reverse', 'kyc.view', 'kyc.verify', 'compliance.flag', 'audit.view'],
  },
  {
    id: 'r5', name: 'Customer', description: 'Standard end-user permissions', userCount: 1250, isSystem: false,
    permissions: ['transactions.view'],
  },
  {
    id: 'r6', name: 'Custom Manager', description: 'Custom role for regional managers', userCount: 3, isSystem: false,
    permissions: ['users.view', 'users.create', 'transactions.view', 'transactions.approve', 'cards.view', 'cards.freeze', 'cards.issue', 'kyc.view'],
  },
];

export default function RoleManagement() {
  const [roles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Role Management</h1>
          <p className="text-sm text-text-secondary mt-0.5">Define and manage roles and their permissions.</p>
        </div>
        <Button iconLeft={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>Create Role</Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {roles.length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon={Shield} title="No roles defined" description="Create your first role to get started." action={{ label: 'Create Role', onClick: () => setShowCreateModal(true) }} />
          </div>
        ) : (
          roles.map((role) => (
            <motion.div
              key={role.id}
              variants={itemVariants}
              onClick={() => setSelectedRole(role)}
              className={clsx(
                'card-base p-5 hover:shadow-card-hover transition-shadow cursor-pointer',
                selectedRole?.id === role.id && 'ring-2 ring-primary-500',
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                {role.isSystem && (
                  <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-surface text-text-muted rounded-full border border-surface-border">
                    System
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-text mb-1">{role.name}</h3>
              <p className="text-xs text-text-muted mb-4 line-clamp-2">{role.description}</p>
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {role.userCount} users
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  {role.permissions.length} permissions
                </span>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <Modal
        isOpen={!!selectedRole && !showCreateModal}
        onClose={() => setSelectedRole(null)}
        title={selectedRole?.name ?? 'Role Details'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSelectedRole(null)}>Close</Button>
            {selectedRole && !selectedRole.isSystem && (
              <Button variant="primary" size="sm" iconLeft={<Save className="w-4 h-4" />}>Save Changes</Button>
            )}
          </>
        }
      >
        {selectedRole && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-surface-border">
              <Shield className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-text">{selectedRole.description}</p>
                <p className="text-xs text-text-muted mt-0.5">{selectedRole.userCount} users · {selectedRole.permissions.length} permissions</p>
              </div>
              {selectedRole.isSystem && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-warning-50 text-warning-700 rounded-full border border-warning-200">
                  Read Only
                </span>
              )}
            </div>
            <div className="space-y-4">
              {permissionGroups.map((group) => (
                <div key={group.name}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2.5">{group.name}</h4>
                  <div className="space-y-1.5">
                    {group.permissions.map((perm) => {
                      const checked = selectedRole.permissions.includes(perm.key);
                      return (
                        <label
                          key={perm.id}
                          className={clsx(
                            'flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer',
                            checked ? 'bg-primary-50 border-primary-200' : 'bg-white border-surface-border hover:bg-surface',
                            selectedRole.isSystem && 'cursor-not-allowed opacity-70',
                          )}
                        >
                          {checked ? (
                            <CheckSquare className="w-4 h-4 text-primary-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-text-muted flex-shrink-0" />
                          )}
                          <span className="text-sm text-text">{perm.label}</span>
                          <span className="ml-auto text-[10px] font-mono text-text-muted">{perm.key}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Role"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm">Create Role</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Role Name</label>
            <input type="text" placeholder="e.g., Branch Manager" className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
            <textarea rows={3} placeholder="Describe the role's purpose..." className="input-base resize-none" />
          </div>
          <p className="text-xs text-text-muted">You can configure permissions after creating the role.</p>
        </div>
      </Modal>
    </motion.div>
  );
}
