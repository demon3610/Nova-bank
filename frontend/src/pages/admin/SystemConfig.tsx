import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Shield, ArrowRightLeft, Bell, RotateCcw,
  Save,
} from 'lucide-react';
import clsx from 'clsx';
import Button from '@/components/common/Button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ConfigSection {
  id: string;
  title: string;
  icon: typeof Globe;
  description: string;
  fields: ConfigField[];
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'toggle' | 'select';
  value: string | number | boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  helpText?: string;
}

const initialSections: ConfigSection[] = [
  {
    id: 'general',
    title: 'General',
    icon: Globe,
    description: 'Basic application settings and information.',
    fields: [
      { key: 'siteName', label: 'Site Name', type: 'text', value: 'NovaBank', placeholder: 'Enter site name' },
      { key: 'supportEmail', label: 'Support Email', type: 'email', value: 'support@novabank.com', placeholder: 'support@novabank.com' },
      { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'toggle', value: false, helpText: 'When enabled, only admins can access the system.' },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    description: 'Authentication and security policy settings.',
    fields: [
      { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number', value: 5, placeholder: '5', helpText: 'Number of failed attempts before account lockout.' },
      { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number', value: 30, placeholder: '30', helpText: 'Idle session duration before auto-logout.' },
      { key: 'passwordMinLength', label: 'Minimum Password Length', type: 'number', value: 8, placeholder: '8' },
      { key: 'passwordRequireSpecial', label: 'Require Special Characters', type: 'toggle', value: true },
      { key: 'twoFactorRequired', label: 'Require 2FA for Employees', type: 'toggle', value: true },
    ],
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: ArrowRightLeft,
    description: 'Transaction limits and processing rules.',
    fields: [
      { key: 'dailyTransferLimit', label: 'Daily Transfer Limit (₹)', type: 'number', value: 100000, placeholder: '100000' },
      { key: 'maxTransactionAmount', label: 'Max Transaction Amount (₹)', type: 'number', value: 500000, placeholder: '500000' },
      { key: 'otpRequired', label: 'OTP Required for Transfers', type: 'toggle', value: true, helpText: 'Require OTP verification for all transfers.' },
      { key: 'otpThreshold', label: 'OTP Threshold Amount (₹)', type: 'number', value: 10000, placeholder: '10000', helpText: 'OTP required for amounts above this threshold.' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    description: 'Notification channel configuration.',
    fields: [
      { key: 'emailEnabled', label: 'Email Notifications', type: 'toggle', value: true },
      { key: 'smsEnabled', label: 'SMS Notifications', type: 'toggle', value: false, helpText: 'Requires configured SMS provider.' },
      { key: 'pushEnabled', label: 'Push Notifications', type: 'toggle', value: true },
      { key: 'notificationRetention', label: 'Notification Retention (days)', type: 'number', value: 90, placeholder: '90' },
    ],
  },
];

export default function SystemConfig() {
  const [sections, setSections] = useState<ConfigSection[]>(initialSections);
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());

  const updateField = (sectionId: string, fieldKey: string, newValue: string | number | boolean) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? { ...sec, fields: sec.fields.map((f) => (f.key === fieldKey ? { ...f, value: newValue } : f)) }
          : sec,
      ),
    );
    setSavedSections((prev) => {
      const next = new Set(prev);
      next.delete(sectionId);
      return next;
    });
  };

  const saveSection = (sectionId: string) => {
    setSavedSections((prev) => new Set(prev).add(sectionId));
  };

  const resetDefaults = () => {
    setSections(initialSections);
    setSavedSections(new Set());
  };

  const renderField = (field: ConfigField, sectionId: string) => {
    switch (field.type) {
      case 'toggle':
        return (
          <button
            onClick={() => updateField(sectionId, field.key, !field.value)}
            className={clsx(
              'relative w-10 h-5 rounded-full transition-colors',
              field.value ? 'bg-primary-600' : 'bg-surface-border',
            )}
          >
            <span
              className={clsx(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                field.value ? 'translate-x-5' : 'translate-x-0.5',
              )}
            />
          </button>
        );
      case 'select':
        return (
          <select
            value={String(field.value)}
            onChange={(e) => updateField(sectionId, field.key, e.target.value)}
            className="input-base w-auto py-1.5 text-sm"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={String(field.value)}
            onChange={(e) => updateField(sectionId, field.key, Number(e.target.value))}
            placeholder={field.placeholder}
            className="input-base w-32 text-sm"
          />
        );
      default:
        return (
          <input
            type={field.type}
            value={String(field.value)}
            onChange={(e) => updateField(sectionId, field.key, e.target.value)}
            placeholder={field.placeholder}
            className="input-base max-w-xs text-sm"
          />
        );
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">System Configuration</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage global application settings and policies.</p>
        </div>
        <Button variant="ghost" size="sm" iconLeft={<RotateCcw className="w-4 h-4" />} onClick={resetDefaults}>
          Reset Defaults
        </Button>
      </motion.div>

      <div className="space-y-5">
        {sections.map((section) => (
          <motion.div key={section.id} variants={itemVariants} className="card-base p-5">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text">{section.title}</h2>
                  <p className="text-xs text-text-muted">{section.description}</p>
                </div>
              </div>
              {savedSections.has(section.id) && (
                <span className="px-2 py-0.5 text-[10px] font-medium text-success-600 bg-success-50 rounded-full border border-success-200">
                  Saved
                </span>
              )}
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key} className="flex items-center justify-between py-2 border-b border-surface-border last:border-b-0">
                  <div className="flex-1 mr-4">
                    <label className="text-sm font-medium text-text">{field.label}</label>
                    {field.helpText && <p className="text-xs text-text-muted mt-0.5">{field.helpText}</p>}
                  </div>
                  <div className="flex-shrink-0">
                    {renderField(field, section.id)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-surface-border">
              <Button size="sm" variant="primary" iconLeft={<Save className="w-4 h-4" />} onClick={() => saveSection(section.id)}>
                Save {section.title}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
