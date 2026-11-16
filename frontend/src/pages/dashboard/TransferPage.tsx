import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Send, CheckCircle, Calendar, Repeat, ArrowRight,
  AlertCircle, UserPlus, Loader2, Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { accountService } from '@/services/account.service';
import { transactionService } from '@/services/transaction.service';
import type { Account } from '@/types';

const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Select a source account'),
  toAccountNumber: z.string().min(6, 'Enter a valid account number'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
  schedule: z.enum(['now', 'later']),
  scheduledDate: z.string().optional(),
  recurring: z.boolean().optional(),
}).refine((data) => {
  if (data.schedule === 'later' && !data.scheduledDate) return false;
  return true;
}, { message: 'Select a date for scheduled transfer', path: ['scheduledDate'] });

type TransferFormData = z.infer<typeof transferSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function TransferPage() {
  const [searchParams] = useSearchParams();
  const isFastMode = searchParams.get('fast') === 'true';

  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  useEffect(() => {
    accountService.getAccounts()
      .then((res) => {
        setAccounts(res.data);
      })
      .catch(() => {
        toast.error('Failed to load accounts');
      })
      .finally(() => setAccountsLoading(false));
  }, []);

  const {
    register, handleSubmit, watch, formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: { schedule: 'now', recurring: false },
    shouldUnregister: false,
  });

  const fromAccountId = watch('fromAccountId');
  const amount = watch('amount');
  const schedule = watch('schedule');
  const selectedAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccountNumber = watch('toAccountNumber');
  const description = watch('description');

  const insufficientBalance = selectedAccount && Number(amount) > selectedAccount.balance;

  const onSubmit = (_data: TransferFormData) => {
    if (insufficientBalance) {
      toast.error('Insufficient balance');
      return;
    }
    setStep('review');
  };

  const handleConfirm = async () => {
    if (!toAccountNumber || toAccountNumber.length < 6) {
      toast.error('Invalid destination account number');
      setStep('form');
      return;
    }
    setLoading(true);
    try {
      if (isFastMode) {
        const res = await api.post('/transactions/transfer-fast', {
          sourceAccountId: fromAccountId,
          destinationAccountId: toAccountNumber,
          amount: Number(amount),
          description: description || undefined,
        });
        setReferenceNumber(res.data?.data?.transactionId || 'FT_SUCCESS');
      } else {
        const res = await transactionService.transfer({
          fromAccount: fromAccountId,
          toAccount: toAccountNumber,
          amount: Number(amount),
          description: description || undefined,
        });
        setReferenceNumber(res.data.referenceNumber);
      }
      setStep('success');
      toast.success(isFastMode ? 'Instant Fast Wire completed!' : 'Transfer completed successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Transfer failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link to="/dashboard/transactions" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Transactions
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Transfer Money</h1>
            <p className="text-sm text-text-secondary mt-0.5">Send money to any account</p>
          </div>
          {isFastMode && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> Fast Wire Mode
            </span>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.form
            key="form"
            variants={itemVariants}
            initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit(onSubmit)}
            className="card-base p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">From Account</label>
              <select {...register('fromAccountId')} className={clsx('input-base', errors.fromAccountId && 'border-danger-500 ring-1 ring-danger-500')} disabled={accountsLoading}>
                <option value="">{accountsLoading ? 'Loading...' : 'Select account'}</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.type.charAt(0).toUpperCase() + acc.type.slice(1)} (****{acc.accountNumber.slice(-4)}) — ${acc.balance.toFixed(2)}</option>
                ))}
              </select>
              {errors.fromAccountId && <p className="text-xs text-danger-500 mt-1">{errors.fromAccountId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">To Account Number</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 1000010003"
                  {...register('toAccountNumber')}
                  className={clsx('input-base', errors.toAccountNumber && 'border-danger-500 ring-1 ring-danger-500')}
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-surface text-primary-600" title="Select from beneficiaries">
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
              {errors.toAccountNumber && <p className="text-xs text-danger-500 mt-1">{errors.toAccountNumber.message}</p>}
              {!errors.toAccountNumber && (
                <p className="text-xs text-text-muted mt-1">Test accounts: 1000010003, 1000010004, 1000010005</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount')}
                  className={clsx('input-base pl-7', errors.amount && 'border-danger-500 ring-1 ring-danger-500')}
                />
              </div>
              {insufficientBalance && selectedAccount && (
                <p className="text-xs text-danger-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Insufficient balance (${selectedAccount.balance.toFixed(2)} available)</p>
              )}
              {errors.amount && <p className="text-xs text-danger-500 mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Description <span className="text-text-muted">(optional)</span></label>
              <input type="text" placeholder="What's this for?" {...register('description')} className="input-base" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Schedule</label>
              <div className="flex gap-3">
                <label className={clsx(
                  'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                  schedule === 'now' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-border hover:border-primary-200 text-text-secondary',
                )}>
                  <input type="radio" value="now" {...register('schedule')} className="sr-only" />
                  <Send className="w-4 h-4" /> Now
                </label>
                <label className={clsx(
                  'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                  schedule === 'later' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-border hover:border-primary-200 text-text-secondary',
                )}>
                  <input type="radio" value="later" {...register('schedule')} className="sr-only" />
                  <Calendar className="w-4 h-4" /> Later
                </label>
              </div>
              {schedule === 'later' && (
                <input type="date" {...register('scheduledDate')} className="input-base mt-3" min={format(new Date(), 'yyyy-MM-dd')} />
              )}
              {errors.scheduledDate && <p className="text-xs text-danger-500 mt-1">{errors.scheduledDate.message}</p>}
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" {...register('recurring')} className="w-4 h-4 rounded border-surface-border text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-text flex items-center gap-1.5"><Repeat className="w-4 h-4" /> Make this a recurring transfer</span>
            </label>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              Review Transfer <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            variants={itemVariants}
            initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }}
            className="card-base p-6 space-y-5"
          >
            <h2 className="text-lg font-semibold text-text">Review Transfer</h2>
            <div className="space-y-3 p-4 rounded-lg bg-surface border border-surface-border">
              {[
                { label: 'From', value: selectedAccount ? `${selectedAccount.type.charAt(0).toUpperCase() + selectedAccount.type.slice(1)} (****${selectedAccount.accountNumber.slice(-4)})` : '' },
                { label: 'To', value: toAccountNumber },
                { label: 'Amount', value: `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, highlight: true },
                { label: 'Description', value: description || 'No description' },
                { label: 'Schedule', value: schedule === 'now' ? 'Immediately' : `Scheduled for ${format(new Date(watch('scheduledDate') || ''), 'dd MMM yyyy')}` },
                { label: 'Recurring', value: watch('recurring') ? 'Yes' : 'No' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className={clsx('font-medium', item.highlight ? 'text-lg text-primary-700' : 'text-text')}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="btn-secondary flex-1">Edit</button>
              <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            variants={itemVariants}
            initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }}
            className="card-base p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
            <h2 className="text-xl font-bold text-text mb-1">Transfer Successful!</h2>
            <p className="text-sm text-text-secondary mb-6">Your money has been sent successfully.</p>
            <div className="p-4 rounded-lg bg-surface border border-surface-border mb-6 inline-block text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-8">
                  <span className="text-text-secondary">Amount</span>
                  <span className="font-semibold text-text text-lg">${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <span className="text-text-secondary">To</span>
                  <span className="font-medium text-text font-mono">{toAccountNumber}</span>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <span className="text-text-secondary">Reference</span>
                  <span className="font-medium text-text font-mono text-xs">{referenceNumber}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard/transfer" className="btn-primary inline-flex items-center gap-2">
                <Send className="w-4 h-4" /> Another Transfer
              </Link>
              <Link to="/dashboard/transactions" className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Transactions
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
