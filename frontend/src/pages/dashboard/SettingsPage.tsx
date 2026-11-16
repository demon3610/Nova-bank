import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Shield, Smartphone, Bell, Globe, Monitor, Smartphone as DeviceIcon,
  X, Loader2, LogOut, Upload, Code, FileCheck, Eye,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

interface Session {
  id: string; device: string; browser: string; ip: string; location: string; lastActive: string; isCurrent: boolean;
}

interface Device {
  id: string; name: string; type: string; lastUsed: string; isTrusted: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};



function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={itemVariants} className="card-base p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <h2 className="text-base font-semibold text-text">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={clsx(
        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
        enabled ? 'bg-primary-600' : 'bg-surface-border',
      )}
    >
      <span className={clsx(
        'block w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-0.5',
        enabled ? 'translate-x-[22px]' : 'translate-x-0.5',
      )} />
    </button>
  );
}

export default function SettingsPage() {
  const storeUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  // Initialize profile from store user
  useEffect(() => {
    if (storeUser) {
      setProfile({ firstName: storeUser.firstName, lastName: storeUser.lastName, email: storeUser.email, phone: storeUser.phone || '' });
    } else {
      setProfile({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '+1 (555) 123-4567' });
    }
  }, [storeUser]);
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({ transactions: true, security: true, promotions: false, account: true });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [sessionLoading, setSessionLoading] = useState<string | null>(null);
  const [deviceLoading, setDeviceLoading] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [templateText, setTemplateText] = useState('Dear ${user.name}, your account balance is ${account.currency} ${account.balance}.');
  const [previewOutput, setPreviewOutput] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [kycDocNum, setKycDocNum] = useState('');
  const [kycLoading, setKycLoading] = useState(false);

  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      await api.patch('/users/profile/settings', profileForm);
      setProfile(profileForm);
      setEditProfile(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await api.post('/users/profile/upload', {
          filename: file.name,
          contentType: file.type,
          fileData: base64Data,
        });
        setAvatarUrl(res.data?.data?.avatarUrl || `/api/users/avatar/${file.name}`);
        toast.success('Avatar uploaded successfully');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Upload failed');
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTemplatePreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await api.post('/notifications/preview-custom', { template: templateText });
      setPreviewOutput(res.data?.data?.renderedPreview || '');
      toast.success('Template rendered');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to render template');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleKycSubmit = async () => {
    if (!kycDocNum) {
      toast.error('Enter document number');
      return;
    }
    setKycLoading(true);
    try {
      await api.post('/employees/kyc', {
        documentType: 'passport',
        documentNumber: kycDocNum,
      });
      toast.success('KYC application submitted');
      setKycDocNum('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setKycLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.newPass) { toast.error('Fill all fields'); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { toast.error('Passwords do not match'); return; }
    if (passwordForm.newPass.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setPasswordLoading(true);
    try {
      await authService.changePassword(passwordForm.current, passwordForm.newPass);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      toast.success('Password changed');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessRes, devRes] = await Promise.all([
          authService.getSessions(),
          authService.getDevices(),
        ]);
        if (sessRes.data) setSessions(sessRes.data as Session[]);
        if (devRes.data) setDevices(devRes.data as Device[]);
      } catch {
        toast.error('Failed to load session data');
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchData();
  }, []);

  const revokeSession = async (id: string) => {
    setSessionLoading(id);
    try {
      await authService.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success('Session revoked');
    } catch {
      toast.error('Failed to revoke session');
    } finally {
      setSessionLoading(null);
    }
  };

  const removeDevice = async (id: string) => {
    setDeviceLoading(id);
    try {
      await authService.removeDevice(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
      toast.success('Device removed');
    } catch {
      toast.error('Failed to remove device');
    } finally {
      setDeviceLoading(null);
    }
  };

  const trustDevice = async (id: string) => {
    setDeviceLoading(id);
    try {
      await authService.trustDevice(id);
      setDevices((prev) => prev.map((d) => d.id === id ? { ...d, isTrusted: true } : d));
      toast.success('Device trusted');
    } catch {
      toast.error('Failed to trust device');
    } finally {
      setDeviceLoading(null);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">Manage your account settings and preferences</p>
      </motion.div>

      <SectionCard icon={User} title="Profile">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-surface-border mb-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 border border-primary-200 overflow-hidden flex items-center justify-center flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-primary-600" />
            )}
          </div>
          <div>
            <label className="btn-secondary text-xs cursor-pointer inline-flex items-center gap-1.5 py-1.5 px-3">
              <Upload className="w-3.5 h-3.5" />
              {avatarLoading ? 'Uploading...' : 'Upload Avatar'}
              <input type="file" accept=".jpg,.jpeg,.png,.svg" onChange={handleAvatarUpload} className="hidden" />
            </label>
            <p className="text-[11px] text-text-muted mt-1">Supports JPG, PNG, and SVG vector images</p>
          </div>
        </div>

        {editProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">First Name</label>
                <input value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Last Name</label>
                <input value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} className="input-base" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email</label>
              <input value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone</label>
              <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="input-base" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditProfile(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleProfileSave} disabled={profileLoading} className="btn-primary flex items-center gap-2">
                {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'First Name', value: profile.firstName },
                { label: 'Last Name', value: profile.lastName },
                { label: 'Email', value: profile.email },
                { label: 'Phone', value: profile.phone },
              ].map((field) => (
                <div key={field.label} className="p-3 rounded-lg bg-surface border border-surface-border">
                  <p className="text-xs text-text-secondary mb-0.5">{field.label}</p>
                  <p className="text-sm font-medium text-text">{field.value}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setEditProfile(true)} className="btn-secondary">Edit Profile</button>
          </div>
        )}
      </SectionCard>

      <SectionCard icon={Shield} title="Security">
        <div className="space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text">Change Password</h3>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'} placeholder="Current password" value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="input-base pr-10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'} placeholder="New password" value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  className="input-base pr-10"
                />
              </div>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'} placeholder="Confirm new password" value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="input-base pr-10"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPasswords} onChange={() => setShowPasswords(!showPasswords)} className="w-4 h-4 rounded border-surface-border text-primary-600" />
                <span className="text-xs text-text-secondary">Show passwords</span>
              </label>
              <button onClick={handlePasswordChange} disabled={passwordLoading} className="btn-primary text-xs flex items-center gap-1.5">
                {passwordLoading && <Loader2 className="w-3 h-3 animate-spin" />} Update Password
              </button>
            </div>
          </div>

          <div className="border-t border-surface-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text">Two-Factor Authentication</h3>
                <p className="text-xs text-text-secondary mt-0.5">Add an extra layer of security to your account</p>
              </div>
              <Toggle enabled={twoFactor} onChange={setTwoFactor} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Smartphone} title="Trusted Devices">
        {settingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
        <div className="space-y-3">
          {devices.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No trusted devices</p>
          ) : (
            devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                    {device.type === 'mobile' ? <DeviceIcon className="w-4 h-4 text-primary-600" /> : <Monitor className="w-4 h-4 text-primary-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{device.name}</p>
                    <p className="text-xs text-text-muted">Last used: {device.lastUsed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!device.isTrusted && (
                    <button
                      onClick={() => trustDevice(device.id)}
                      disabled={deviceLoading === device.id}
                      className="p-1.5 rounded-md hover:bg-success-50 text-text-secondary hover:text-success-600 transition-colors"
                      title="Trust device"
                    >
                      {deviceLoading === device.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => removeDevice(device.id)}
                    disabled={deviceLoading === device.id}
                    className="p-1.5 rounded-md hover:bg-danger-50 text-text-secondary hover:text-danger-600 transition-colors"
                  >
                    {deviceLoading === device.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </SectionCard>

      <SectionCard icon={Bell} title="Notification Preferences">
        <div className="space-y-3">
          {([
            { key: 'transactions', label: 'Transaction Alerts', desc: 'Get notified of deposits, withdrawals, and transfers' },
            { key: 'security', label: 'Security Alerts', desc: 'Login attempts, password changes, and security events' },
            { key: 'account', label: 'Account Updates', desc: 'Statement ready, interest changes, and account notices' },
            { key: 'promotions', label: 'Promotional Emails', desc: 'Offers, rewards, and marketing communications' },
          ] as const).map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
              <div>
                <p className="text-sm font-medium text-text">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
              <Toggle
                enabled={notifPrefs[item.key]}
                onChange={(v) => setNotifPrefs({ ...notifPrefs, [item.key]: v })}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-surface-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text flex items-center gap-1.5">
              <Code className="w-4 h-4 text-primary-600" /> Custom Alert Notification Template
            </h3>
          </div>
          <p className="text-xs text-text-muted mb-2">
            Customize alert templates with dynamic expression placeholders such as {'${user.name}'} and {'${account.balance}'}.
          </p>
          <textarea
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            rows={3}
            className="input-base font-mono text-xs w-full mb-2"
          />
          <button
            onClick={handleTemplatePreview}
            disabled={previewLoading}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            {previewLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
            Preview Template
          </button>
          {previewOutput && (
            <div className="mt-2.5 p-3 rounded-lg bg-surface-muted border border-surface-border font-mono text-xs text-text break-all">
              <span className="font-semibold text-primary-600 block mb-1">Rendered Output:</span>
              {previewOutput}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard icon={FileCheck} title="Identity & KYC Verification">
        <div className="space-y-3">
          <p className="text-xs text-text-muted">
            Submit your government identity document to upgrade your account tier and credit limits.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Passport P9821245 or National ID"
              value={kycDocNum}
              onChange={(e) => setKycDocNum(e.target.value)}
              className="input-base text-sm flex-1"
            />
            <button
              onClick={handleKycSubmit}
              disabled={kycLoading}
              className="btn-primary text-xs flex items-center gap-1.5 px-4"
            >
              {kycLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit Documents
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Globe} title="Active Sessions">
        {settingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No active sessions</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', session.isCurrent ? 'bg-success-50' : 'bg-surface-border')}>
                    <Monitor className={clsx('w-4 h-4', session.isCurrent ? 'text-success-600' : 'text-text-secondary')} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text truncate">{session.device}</p>
                      {session.isCurrent && <span className="text-[10px] font-medium text-success-600 bg-success-50 px-1.5 py-0.5 rounded-full">Current</span>}
                    </div>
                    <p className="text-xs text-text-muted truncate">{session.browser} · {session.location} · {session.ip}</p>
                    <p className="text-xs text-text-muted">Active: {session.lastActive}</p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    disabled={sessionLoading === session.id}
                    className="p-1.5 rounded-md hover:bg-danger-50 text-text-secondary hover:text-danger-600 transition-colors flex-shrink-0"
                    title="Revoke session"
                  >
                    {sessionLoading === session.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        )}
      </SectionCard>
    </motion.div>
  );
}
