import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, CreditCard, Snowflake, Play, Ban, RefreshCw,
  Eye, User, Building2,
  Shield,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import type { Card, CardStatus } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const mockCards: Card[] = [
  { id: 'c1', cardNumber: '4532123456789012', cardholderName: 'Rahul Sharma', userId: 'u1', accountId: 'a1', type: 'debit', network: 'Visa', expiryMonth: 12, expiryYear: 2027, status: 'active', isVirtual: false, dailyLimit: 50000, monthlyLimit: 500000, spentToday: 12500 },
  { id: 'c2', cardNumber: '5422123456789013', cardholderName: 'Priya Patel', userId: 'u2', accountId: 'a2', type: 'credit', network: 'Mastercard', expiryMonth: 8, expiryYear: 2026, status: 'active', isVirtual: true, dailyLimit: 100000, monthlyLimit: 1000000, spentToday: 34000 },
  { id: 'c3', cardNumber: '4532123456789014', cardholderName: 'Amit Singh', userId: 'u3', accountId: 'a3', type: 'debit', network: 'Visa', expiryMonth: 3, expiryYear: 2025, status: 'frozen', isVirtual: false, dailyLimit: 25000, monthlyLimit: 250000, spentToday: 0 },
  { id: 'c4', cardNumber: '6011123456789015', cardholderName: 'Sneha Reddy', userId: 'u4', accountId: 'a4', type: 'credit', network: 'RuPay', expiryMonth: 10, expiryYear: 2028, status: 'active', isVirtual: false, dailyLimit: 75000, monthlyLimit: 750000, spentToday: 8900 },
  { id: 'c5', cardNumber: '5422123456789016', cardholderName: 'Vikram Joshi', userId: 'u5', accountId: 'a5', type: 'debit', network: 'Mastercard', expiryMonth: 6, expiryYear: 2024, status: 'cancelled', isVirtual: false, dailyLimit: 50000, monthlyLimit: 500000, spentToday: 0 },
  { id: 'c6', cardNumber: '4532123456789017', cardholderName: 'Ananya Singh', userId: 'u6', accountId: 'a6', type: 'debit', network: 'Visa', expiryMonth: 1, expiryYear: 2026, status: 'expired', isVirtual: true, dailyLimit: 30000, monthlyLimit: 300000, spentToday: 0 },
];

const customerInfo: Record<string, { name: string; email: string; phone: string; accountNumber: string; balance: number }> = {
  u1: { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91-98765-43210', accountNumber: '****2345', balance: 125000 },
  u2: { name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91-98765-43211', accountNumber: '****6789', balance: 45000 },
  u3: { name: 'Amit Singh', email: 'amit.singh@email.com', phone: '+91-98765-43212', accountNumber: '****1234', balance: 89000 },
  u4: { name: 'Sneha Reddy', email: 'sneha.reddy@email.com', phone: '+91-98765-43213', accountNumber: '****5678', balance: 230000 },
  u5: { name: 'Vikram Joshi', email: 'vikram.joshi@email.com', phone: '+91-98765-43214', accountNumber: '****9012', balance: 67000 },
  u6: { name: 'Ananya Singh', email: 'ananya.singh@email.com', phone: '+91-98765-43215', accountNumber: '****3456', balance: 15000 },
};

const statusVariant: Record<CardStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  frozen: 'warning',
  cancelled: 'danger',
  expired: 'neutral',
};

type ActionType = 'freeze' | 'unfreeze' | 'block' | 'replace';

const actionConfig: Record<ActionType, { label: string; icon: typeof Snowflake; confirmTitle: string; confirmMessage: string; variant: 'warning' | 'success' | 'danger' | 'info' }> = {
  freeze: {
    label: 'Freeze', icon: Snowflake, variant: 'warning',
    confirmTitle: 'Freeze Card', confirmMessage: 'Are you sure you want to freeze this card? The card will be temporarily disabled.',
  },
  unfreeze: {
    label: 'Unfreeze', icon: Play, variant: 'success',
    confirmTitle: 'Unfreeze Card', confirmMessage: 'Are you sure you want to unfreeze this card? It will be fully operational again.',
  },
  block: {
    label: 'Block', icon: Ban, variant: 'danger',
    confirmTitle: 'Block Card', confirmMessage: 'Are you sure you want to permanently block this card? This action cannot be undone.',
  },
  replace: {
    label: 'Replace', icon: RefreshCw, variant: 'info',
    confirmTitle: 'Replace Card', confirmMessage: 'A new card will be issued. The existing card will be blocked. Continue?',
  },
};

function maskCardNumber(num: string): string {
  return `****${num.slice(-4)}`;
}

export default function CardManagement() {
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ card: Card; action: ActionType } | null>(null);
  const [loading] = useState(false);

  const filteredCards = useMemo(() => {
    if (!search.trim()) return mockCards;
    const q = search.toLowerCase();
    return mockCards.filter(
      (c) => maskCardNumber(c.cardNumber).includes(q) || c.cardholderName.toLowerCase().includes(q),
    );
  }, [search]);

  const handleAction = (_action: ActionType) => {
    setConfirmAction(null);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text">Card Management</h1>
        <p className="text-sm text-text-secondary mt-0.5">Manage and monitor all bank-issued cards.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by card number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
          />
        </div>
      </motion.div>

      {loading ? (
        <LoadingSkeleton variant="table" count={6} />
      ) : filteredCards.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No cards found"
          description={search ? 'Try a different search term.' : 'No cards have been issued yet.'}
        />
      ) : (
        <motion.div variants={itemVariants} className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Card</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Cardholder</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Network</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Expiry</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card, idx) => (
                  <tr
                    key={card.id}
                    className={clsx(
                      'border-b border-surface-border transition-colors',
                      idx % 2 === 0 ? 'bg-white' : 'bg-surface/50',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{maskCardNumber(card.cardNumber)}</p>
                          <p className="text-[11px] text-text-muted">{card.isVirtual ? 'Virtual' : 'Physical'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text">{card.cardholderName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm capitalize text-text">{card.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary">{card.network}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={statusVariant[card.status]} size="sm">
                        {card.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary">{format(new Date(card.expiryYear, card.expiryMonth - 1), 'MM/yy')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCard(card)}
                          className="p-1.5 rounded-button text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {card.status === 'active' && (
                          <button
                            onClick={() => setConfirmAction({ card, action: 'freeze' })}
                            className="p-1.5 rounded-button text-warning-600 hover:bg-warning-50 transition-colors"
                            title="Freeze"
                          >
                            <Snowflake className="w-4 h-4" />
                          </button>
                        )}
                        {card.status === 'frozen' && (
                          <button
                            onClick={() => setConfirmAction({ card, action: 'unfreeze' })}
                            className="p-1.5 rounded-button text-success-600 hover:bg-success-50 transition-colors"
                            title="Unfreeze"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {(card.status === 'active' || card.status === 'frozen') && (
                          <>
                            <button
                              onClick={() => setConfirmAction({ card, action: 'block' })}
                              className="p-1.5 rounded-button text-danger-600 hover:bg-danger-50 transition-colors"
                              title="Block"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ card, action: 'replace' })}
                              className="p-1.5 rounded-button text-primary-600 hover:bg-primary-50 transition-colors"
                              title="Replace"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <Modal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title="Card Details"
        size="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedCard(null)}>Close</Button>
        }
      >
        {selectedCard && (() => {
          const info = customerInfo[selectedCard.userId];
          return (
            <div className="space-y-6">
              <div className="p-4 rounded-card bg-gradient-to-br from-primary-800 to-primary-900 text-white">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs font-medium uppercase tracking-wider opacity-80">{selectedCard.network}</p>
                  <CreditCard className="w-5 h-5 opacity-80" />
                </div>
                <p className="text-lg font-mono tracking-widest mb-4">{selectedCard.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider opacity-70">Cardholder</p>
                    <p className="text-sm font-medium">{selectedCard.cardholderName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider opacity-70">Expires</p>
                    <p className="text-sm font-medium">{format(new Date(selectedCard.expiryYear, selectedCard.expiryMonth - 1), 'MM/yy')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-surface border border-surface-border">
                  <p className="text-xs text-text-muted mb-1">Status</p>
                  <StatusBadge variant={statusVariant[selectedCard.status]} size="sm">{selectedCard.status}</StatusBadge>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-surface-border">
                  <p className="text-xs text-text-muted mb-1">Type</p>
                  <p className="text-sm font-medium text-text capitalize">{selectedCard.type} {selectedCard.isVirtual ? '(Virtual)' : '(Physical)'}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-surface-border">
                  <p className="text-xs text-text-muted mb-1">Daily Limit</p>
                  <p className="text-sm font-medium text-text">₹{selectedCard.dailyLimit.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-surface-border">
                  <p className="text-xs text-text-muted mb-1">Spent Today</p>
                  <p className="text-sm font-medium text-text">₹{selectedCard.spentToday.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text mb-3">Linked Account</h4>
                <div className="p-3 rounded-lg bg-surface border border-surface-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Account</span>
                    <span className="text-sm text-text">{info.accountNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Balance</span>
                    <span className="text-sm font-medium text-text">₹{info.balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text mb-3">Customer Info</h4>
                <div className="p-3 rounded-lg bg-surface border border-surface-border space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text">{info.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text">{info.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text">{info.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

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
                variant={confirmAction.action === 'freeze' ? 'primary' : confirmAction.action === 'unfreeze' ? 'primary' : 'danger'}
                size="sm"
                onClick={() => handleAction(confirmAction.action)}
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
