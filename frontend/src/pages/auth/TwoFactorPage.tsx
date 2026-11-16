import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Shield, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { ROUTES } from '@/constants';

const CODE_LENGTH = 6;

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pastedData) return;
    const newCode = Array(CODE_LENGTH).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    const nextIndex = Math.min(pastedData.length, CODE_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      toast.error('Please enter the complete authentication code');
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success('Two-factor authentication verified');
      navigate(ROUTES.DASHBOARD.HOME, { replace: true });
    } catch {
      toast.error('Invalid code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async () => {
    if (!recoveryCode.trim()) {
      toast.error('Please enter your recovery code');
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success('Recovery code accepted');
      navigate(ROUTES.DASHBOARD.HOME, { replace: true });
    } catch {
      toast.error('Invalid recovery code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  const isComplete = code.every((digit) => digit !== '');

  if (showRecovery) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-warning-50 flex items-center justify-center mb-4">
            <KeyRound className="w-7 h-7 text-warning-500" />
          </div>
          <h1 className="text-2xl font-bold text-text">Recovery code</h1>
          <p className="text-text-secondary text-sm mt-1.5 leading-relaxed max-w-xs mx-auto">
            Enter one of your backup recovery codes to regain access to your account.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="recoveryCode" className="block text-sm font-medium text-text mb-1.5">
              Recovery code
            </label>
            <input
              id="recoveryCode"
              type="text"
              autoComplete="off"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              className="input-base text-center font-mono tracking-widest uppercase"
              placeholder="XXXXX-XXXXX-XXXXX"
            />
          </div>

          <button
            onClick={handleRecoverySubmit}
            disabled={isSubmitting || !recoveryCode.trim()}
            className="btn-primary w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify recovery code'
            )}
          </button>

          <button
            onClick={() => setShowRecovery(false)}
            className="btn-secondary w-full"
          >
            Back to authenticator
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <Shield className="w-7 h-7 text-primary-800" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F4C81]">Two-factor authentication</h1>
        <p className="text-text-secondary text-sm mt-1.5 leading-relaxed max-w-xs mx-auto">
          Enter the 6-digit code from your authenticator app to continue.
        </p>
      </div>

      <div className="flex justify-center gap-2.5 mb-8">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={clsx(
              'w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-semibold text-text',
              'input-base transition-all duration-150',
              digit && 'border-primary-800 ring-1 ring-primary-800'
            )}
          />
        ))}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleVerify}
          disabled={!isComplete || isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </button>

        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="btn-secondary w-full"
        >
          Cancel
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => setShowRecovery(true)}
          className="text-sm text-primary-800 hover:text-primary-700 font-medium transition-colors"
        >
          Use a recovery code instead
        </button>
      </div>

      <Link
        to={ROUTES.AUTH.LOGIN}
        className="mt-4 flex items-center justify-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>
    </motion.div>
  );
}
