import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Smartphone, Timer, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { ROUTES } from '@/constants';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const maskedContact = searchParams.get('contact') || 'j***@company.com';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (countdown === 0) setCanResend(true);
  }, [countdown, canResend]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedData) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(RESEND_COOLDOWN);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    toast.success('Verification code resent');
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      toast.error('Please enter the complete verification code');
      return;
    }
    setIsSubmitting(true);
    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success('Email verified successfully!');
      navigate(ROUTES.DASHBOARD.HOME, { replace: true });
    } catch {
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <Smartphone className="w-7 h-7 text-primary-800" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F4C81]">Verify your identity</h1>
        <p className="text-text-secondary text-sm mt-1.5 leading-relaxed max-w-xs mx-auto">
          Enter the verification code sent to{' '}
          <span className="font-medium text-text">{maskedContact}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2.5 mb-8">
        {otp.map((digit, index) => (
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

      <button
        onClick={handleVerify}
        disabled={!isComplete || isSubmitting}
        className="btn-primary w-full mb-5"
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

      <div className="text-center space-y-3">
        <button
          onClick={handleResend}
          disabled={!canResend}
          className={clsx(
            'inline-flex items-center gap-1.5 text-sm transition-colors',
            canResend
              ? 'text-primary-800 hover:text-primary-700 cursor-pointer'
              : 'text-text-muted cursor-not-allowed'
          )}
        >
          {canResend ? (
            <>
              <RotateCw className="w-3.5 h-3.5" />
              Resend code
            </>
          ) : (
            <>
              <Timer className="w-3.5 h-3.5" />
              Resend in {countdown}s
            </>
          )}
        </button>

        <div>
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Change email or phone
          </Link>
        </div>
      </div>

      <Link
        to={ROUTES.AUTH.LOGIN}
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>
    </motion.div>
  );
}
