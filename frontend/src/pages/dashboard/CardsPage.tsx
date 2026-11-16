import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Plus, MoreVertical, Snowflake, Flame, RefreshCw,
  Lock, SlidersHorizontal, X, ChevronDown, ChevronUp,
  CheckCircle, Clock, Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { cardService } from '@/services/card.service';
import { accountService } from '@/services/account.service';
import { useAuthStore } from '@/store/authStore';
import type { Card } from '@/types';

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
  cancelled: 'bg-danger-50 text-danger-600 border-danger-200',
  expired: 'bg-surface text-text-muted border-surface-border',
};

function StatusBadge({ status }: { status: string }) {
  const Icon = status === 'active' ? CheckCircle : status === 'frozen' ? Snowflake : status === 'cancelled' ? X : Clock;
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border', statusColors[status] || 'bg-surface text-text-secondary border-surface-border')}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
}

function CreditCardVisual({ card, onAction }: { card: Card; onAction: (action: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const isDark = card.type === 'debit';

  return (
    <div className="card-base overflow-hidden group">
      <div className={clsx('p-5 text-white relative overflow-hidden', isDark ? 'bg-primary-800' : 'bg-amber-700')}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-80">{card.type} card</p>
              <p className="text-xs font-medium mt-0.5">{card.network}</p>
            </div>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-md hover:bg-white/20 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-8 w-44 bg-surface-card border border-surface-border shadow-dropdown rounded-button py-1 z-10"
                  >
                    {[
                      { label: card.status === 'frozen' ? 'Unfreeze' : 'Freeze', icon: card.status === 'frozen' ? Flame : Snowflake, action: 'freeze' },
                      { label: 'Replace', icon: RefreshCw, action: 'replace' },
                      { label: 'Update PIN', icon: Lock, action: 'pin' },
                      { label: 'View Limits', icon: SlidersHorizontal, action: 'limits' },
                    ].map((item) => (
                      <button
                        key={item.action}
                        onClick={() => { setShowMenu(false); onAction(item.action); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface transition-colors"
                      >
                        <item.icon className="w-3.5 h-3.5" /> {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-lg font-mono tracking-[4px] mb-4">
            **** **** **** {card.cardNumber.slice(-4)}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Cardholder</p>
              <p className="text-sm font-medium">{card.cardholderName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Expires</p>
              <p className="text-sm font-medium font-mono">{String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear.toString().slice(-2)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <StatusBadge status={card.status} />
        {card.isVirtual && <span className="text-[10px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Virtual</span>}
      </div>
    </div>
  );
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<'debit' | 'credit'>('debit');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const selectedNetwork = 'Visa';
  const [isVirtual, setIsVirtual] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await cardService.getCards();
        if (res.data) setCards(res.data);
      } catch {
        toast.error('Failed to load cards');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const openApplyModal = async () => {
    setShowApplyModal(true);
    setSelectedType('debit');
    setIsVirtual(false);
    if (!selectedAccountId) {
      try {
        const res = await accountService.getAccounts();
        if (res.data && res.data.length > 0) setSelectedAccountId(res.data[0].id);
      } catch {
        toast.error('Failed to load accounts');
      }
    }
  };

  const handleCardAction = async (cardId: string, action: string) => {
    try {
      if (action === 'freeze') {
        const card = cards.find((c) => c.id === cardId);
        if (!card) return;
        if (card.status === 'frozen') {
          await cardService.unfreezeCard(cardId);
          setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, status: 'active' } : c));
          toast.success('Card unfrozen');
        } else {
          await cardService.freezeCard(cardId);
          setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, status: 'frozen' } : c));
          toast.success('Card frozen');
        }
      } else if (action === 'replace') {
        await cardService.replaceCard(cardId);
        toast.success('Card replacement requested');
      } else if (action === 'pin') {
        toast.success('PIN update initiated');
      } else if (action === 'limits') {
        toast.success('Limit settings opened');
      }
    } catch {
      toast.error('Failed to perform action');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Cards</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage your debit and credit cards</p>
        </div>
        <button onClick={openApplyModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Apply for New Card
        </button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card) => (
          <motion.div key={card.id} variants={itemVariants} layout>
            <CreditCardVisual card={card} onAction={(action) => handleCardAction(card.id, action)} />
            <AnimatePresence>
              {expandedId === card.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="card-base border-t-0 rounded-t-none p-4 space-y-3 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-surface border border-surface-border">
                      <p className="text-xs text-text-secondary">Daily Limit</p>
                      <p className="text-sm font-semibold text-text">${card.dailyLimit.toLocaleString()}</p>
                      <div className="mt-1.5 w-full h-1.5 bg-surface-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(card.spentToday / card.dailyLimit) * 100}%` }} />
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5">${card.spentToday.toLocaleString()} spent today</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface border border-surface-border">
                      <p className="text-xs text-text-secondary">Monthly Limit</p>
                      <p className="text-sm font-semibold text-text">${card.monthlyLimit.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>Issued: Jan 2023</span>
                    <span>Type: {card.isVirtual ? 'Virtual' : 'Physical'}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setExpandedId(expandedId === card.id ? null : card.id)}
              className="w-full flex items-center justify-center gap-1 py-2 text-xs text-text-secondary hover:text-text transition-colors"
            >
              {expandedId === card.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expandedId === card.id ? 'Hide Details' : 'Show Details'}
            </button>
          </motion.div>
        ))}
        {cards.length === 0 && (
          <motion.div variants={itemVariants} className="col-span-full card-base p-12 text-center">
            <CreditCard className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <h3 className="text-base font-semibold text-text mb-1">No Cards Yet</h3>
            <p className="text-sm text-text-muted mb-4">Apply for your first debit or credit card.</p>
            <button onClick={() => setShowApplyModal(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Apply for New Card
            </button>
          </motion.div>
        )}
      </div>
      )}

      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-base p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text">Apply for New Card</h2>
                <button onClick={() => setShowApplyModal(false)} className="p-1 rounded-md hover:bg-surface transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Card Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { type: 'debit' as const, icon: CreditCard, desc: 'Direct access to your funds', color: 'bg-primary-800' },
                      { type: 'credit' as const, icon: CreditCard, desc: 'Credit line with rewards', color: 'bg-amber-700' },
                    ]).map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => setSelectedType(opt.type)}
                        className={clsx('flex flex-col items-center gap-2 p-5 rounded-lg border transition-all', selectedType === opt.type ? 'border-primary-500 ring-2 ring-primary-200' : 'border-surface-border hover:border-primary-200 hover:shadow-card-hover')}
                      >
                        <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center', opt.color)}>
                          <opt.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-text capitalize">{opt.type}</span>
                        <span className="text-xs text-text-secondary text-center">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={isVirtual} onChange={(e) => setIsVirtual(e.target.checked)} className="w-4 h-4 rounded border-surface-border text-primary-800 focus:ring-primary-500 cursor-pointer" />
                  <span className="text-sm text-text">Virtual card (no physical delivery)</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowApplyModal(false)} disabled={submitting} className="btn-secondary flex-1">Cancel</button>
                  <button
                    disabled={submitting || !selectedAccountId}
                    onClick={async () => {
                      if (!selectedAccountId) return;
                      setSubmitting(true);
                      try {
                        await cardService.createCard({
                          accountId: selectedAccountId,
                          cardholderName: user ? `${user.firstName} ${user.lastName}` : 'Cardholder',
                          type: selectedType,
                          network: selectedNetwork,
                          isVirtual,
                        });
                        toast.success('Card created successfully');
                        setShowApplyModal(false);
                        const res = await cardService.getCards();
                        if (res.data) setCards(res.data);
                      } catch (err) {
                        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create card';
                        toast.error(msg);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit Application'}
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
