import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

interface KycApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  documents: string[];
}

const mockApplications: KycApplication[] = [
  { id: '1', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@email.com', status: 'pending', submittedAt: '2024-03-20', documents: ['Aadhaar Card', 'PAN Card'] },
  { id: '2', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@email.com', status: 'pending', submittedAt: '2024-03-19', documents: ['Passport', 'Utility Bill'] },
  { id: '3', firstName: 'Ananya', lastName: 'Reddy', email: 'ananya.reddy@email.com', status: 'verified', submittedAt: '2024-03-18', documents: ['Driving License', 'Bank Statement'] },
];

export default function KycReviewPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedApp, setSelectedApp] = useState<KycApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = filter === 'all' ? mockApplications : mockApplications.filter(a => a.status === filter);

  const statusBadge = (status: KycApplication['status']) => {
    const config = {
      pending: { bg: 'bg-warning-50', text: 'text-warning-600', icon: Clock, label: 'Pending' },
      verified: { bg: 'bg-success-50', text: 'text-success-600', icon: CheckCircle, label: 'Verified' },
      rejected: { bg: 'bg-danger-50', text: 'text-danger-600', icon: XCircle, label: 'Rejected' },
    };
    const c = config[status];
    const Icon = c.icon;
    return <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', c.bg, c.text)}><Icon className="w-3 h-3" />{c.label}</span>;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">KYC Review</h1>
          <p className="text-text-secondary mt-1">Verify customer identities and approve applications</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'verified', 'rejected'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={clsx('px-4 py-2 rounded-button text-sm font-medium transition-colors capitalize', filter === s ? 'bg-primary-800 text-white' : 'bg-surface text-text-secondary border border-surface-border hover:bg-surface-border')}>{s} ({s === 'all' ? mockApplications.length : mockApplications.filter(a => a.status === s).length})</button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {filtered.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              onClick={() => { setSelectedApp(app); setRejectReason(''); }}
              className={clsx('bg-surface-card rounded-card shadow-card border border-surface-border p-4 cursor-pointer transition-all hover:shadow-card-hover', selectedApp?.id === app.id && 'ring-2 ring-primary-500')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-800 font-semibold text-xs">{app.firstName[0]}{app.lastName[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text text-sm">{app.firstName} {app.lastName}</p>
                  <p className="text-xs text-text-secondary">{app.email}</p>
                </div>
                <div className="text-right">
                  {statusBadge(app.status)}
                  <p className="text-xs text-text-muted mt-1">{app.submittedAt}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-surface-card rounded-card shadow-card border border-surface-border p-12 text-center">
              <FileCheck className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">No applications found</p>
            </div>
          )}
        </div>

        {selectedApp && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface-card rounded-card shadow-card border border-surface-border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center text-primary-800 font-semibold">{selectedApp.firstName[0]}{selectedApp.lastName[0]}</div>
              <div>
                <h2 className="text-lg font-semibold text-text">{selectedApp.firstName} {selectedApp.lastName}</h2>
                <p className="text-sm text-text-secondary">{selectedApp.email}</p>
              </div>
              {statusBadge(selectedApp.status)}
            </div>

            <h3 className="text-sm font-medium text-text mb-3">Submitted Documents</h3>
            <div className="space-y-2 mb-6">
              {selectedApp.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-button bg-surface border border-surface-border">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center"><FileCheck className="w-5 h-5 text-primary-600" /></div>
                  <span className="text-sm text-text">{doc}</span>
                  <button className="ml-auto text-sm text-primary-600 hover:text-primary-800 font-medium">View</button>
                </div>
              ))}
            </div>

            {selectedApp.status === 'pending' && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 rounded-button bg-success-600 text-white text-sm font-medium hover:bg-success-700 transition-colors flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Approve</button>
                  <button className="flex-1 py-2.5 rounded-button bg-danger-600 text-white text-sm font-medium hover:bg-danger-700 transition-colors flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Reject</button>
                </div>
                <div>
                  <textarea
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-button border border-surface-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors resize-none"
                  />
                </div>
                <button className="w-full py-2 rounded-button border border-surface-border text-text-secondary text-sm font-medium hover:bg-surface transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Request More Information
                </button>
              </div>
            )}

            {selectedApp.status === 'verified' && (
              <div className="p-4 rounded-button bg-success-50 border border-success-200 text-center">
                <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-success-700">KYC Verified</p>
                <p className="text-xs text-success-600 mt-1">Identity has been verified successfully</p>
              </div>
            )}

            {selectedApp.status === 'rejected' && (
              <div className="p-4 rounded-button bg-danger-50 border border-danger-200 text-center">
                <XCircle className="w-8 h-8 text-danger-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-danger-700">KYC Rejected</p>
                <p className="text-xs text-danger-600 mt-1">Application has been rejected</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
