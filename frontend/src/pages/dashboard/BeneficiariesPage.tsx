import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit3, Trash2, X, CheckCircle, User, Building2,
  AlertTriangle, Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { beneficiaryService } from '@/services/beneficiary.service';
import type { Beneficiary } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};



interface BeneficiaryFormData {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  name: string;
  nickname: string;
  transferLimit: string;
}

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BeneficiaryFormData>({
    accountNumber: '', ifscCode: '', bankName: '', name: '', nickname: '', transferLimit: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BeneficiaryFormData, string>>>({});

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        const res = await beneficiaryService.getBeneficiaries();
        if (res.data) setBeneficiaries(res.data);
      } catch {
        toast.error('Failed to load beneficiaries');
      } finally {
        setLoading(false);
      }
    };
    fetchBeneficiaries();
  }, []);

  const filtered = beneficiaries.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.nickname.toLowerCase().includes(search.toLowerCase()) ||
    b.bankName.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setFormData({ accountNumber: '', ifscCode: '', bankName: '', name: '', nickname: '', transferLimit: '' });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (b: Beneficiary) => {
    setEditingId(b.id);
    setFormData({
      accountNumber: b.accountNumber, ifscCode: b.ifscCode, bankName: b.bankName,
      name: b.name, nickname: b.nickname, transferLimit: '',
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.accountNumber || formData.accountNumber.length < 6) newErrors.accountNumber = 'Valid account number required';
    if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code required';
    if (!formData.bankName) newErrors.bankName = 'Bank name required';
    if (!formData.name) newErrors.name = 'Beneficiary name required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await beneficiaryService.updateBeneficiary(editingId, {
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          name: formData.name,
          nickname: formData.nickname || formData.name,
        });
        if (res.data) {
          setBeneficiaries((prev) => prev.map((b) => b.id === editingId ? res.data! : b));
        }
        toast.success('Beneficiary updated');
      } else {
        const res = await beneficiaryService.addBeneficiary({
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          name: formData.name,
          nickname: formData.nickname || formData.name,
        });
        if (res.data) setBeneficiaries((prev) => [res.data!, ...prev]);
        toast.success('Beneficiary added');
      }
      setShowForm(false);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save beneficiary';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await beneficiaryService.deleteBeneficiary(id);
      setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
      toast.success('Beneficiary removed');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to remove beneficiary';
      toast.error(msg);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarColors = ['bg-primary-500', 'bg-success-500', 'bg-warning-500', 'bg-danger-500', 'bg-purple-500'];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Beneficiaries</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage your trusted beneficiaries</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Beneficiary
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="card-base p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, nickname, or bank..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((beneficiary, i) => (
          <motion.div key={beneficiary.id} variants={itemVariants} layout className="card-base p-5 hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-4">
              <div className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0',
                avatarColors[i % avatarColors.length],
              )}>
                {getInitials(beneficiary.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  {/* VULNERABILITY: XSS - renders unsanitized user input */}
                  <h3 className="text-base font-semibold text-text truncate" dangerouslySetInnerHTML={{ __html: beneficiary.name }} />
                  {beneficiary.isVerified && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-success-600 bg-success-50 px-1.5 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {!beneficiary.isVerified && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-warning-600 bg-warning-50 px-1.5 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Unverified
                    </span>
                  )}
                </div>
                  {beneficiary.nickname !== beneficiary.name && (
                    <>
                      {/* VULNERABILITY: XSS - renders unsanitized user input */}
                      <p className="text-xs text-text-muted mb-0.5" dangerouslySetInnerHTML={{ __html: beneficiary.nickname }} />
                    </>
                  )}
                <p className="text-sm font-mono text-text-secondary tracking-wider mt-1">
                  **** **** {beneficiary.accountNumber.slice(-4)}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs text-text-secondary">{beneficiary.bankName}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(beneficiary)} className="p-2 rounded-md hover:bg-surface text-text-secondary hover:text-text transition-colors" title="Edit">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(beneficiary.id)} className="p-2 rounded-md hover:bg-danger-50 text-text-secondary hover:text-danger-600 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {!loading && filtered.length === 0 && (
          <motion.div variants={itemVariants} className="col-span-full card-base p-12 text-center">
            <User className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <h3 className="text-base font-semibold text-text mb-1">No Beneficiaries</h3>
            <p className="text-sm text-text-muted mb-4">Add your first beneficiary to start transferring quickly.</p>
            <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Beneficiary
            </button>
          </motion.div>
        )}
      </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, x: 300 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.95, opacity: 0, x: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="card-base p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text">{editingId ? 'Edit Beneficiary' : 'Add Beneficiary'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-surface transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
              <div className="space-y-4">
                {([
                  { key: 'name', label: 'Beneficiary Name', placeholder: 'Full name' },
                  { key: 'nickname', label: 'Nickname', placeholder: 'Optional nickname' },
                  { key: 'accountNumber', label: 'Account Number', placeholder: 'Enter account number' },
                  { key: 'ifscCode', label: 'IFSC Code', placeholder: 'e.g., HDFC0001234' },
                  { key: 'bankName', label: 'Bank Name', placeholder: 'e.g., HDFC Bank' },
                  { key: 'transferLimit', label: 'Transfer Limit', placeholder: 'Per transaction limit' },
                ] as const).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-text mb-1">{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof BeneficiaryFormData]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className={clsx('input-base', errors[field.key as keyof BeneficiaryFormData] && 'border-danger-500')}
                    />
                    {errors[field.key as keyof BeneficiaryFormData] && (
                      <p className="text-xs text-danger-500 mt-1">{errors[field.key as keyof BeneficiaryFormData]}</p>
                    )}
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Update' : 'Add Beneficiary'}
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
