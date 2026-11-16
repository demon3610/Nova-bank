import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { ROUTES } from '@/constants';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/(?=.*[a-z])/.test(password)) score++;
  if (/(?=.*[A-Z])/.test(password)) score++;
  if (/(?=.*\d)/.test(password)) score++;
  if (/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) score++;

  if (score <= 2) return { score: 25, label: 'Weak', color: 'bg-warning-400' };
  if (score <= 4) return { score: 55, label: 'Medium', color: 'bg-warning-500' };
  return { score: 100, label: 'Strong', color: 'bg-success-500' };
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');
  const strength = getPasswordStrength(password ?? '');

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success('Password reset successful!');
    } catch {
      toast.error('Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="text-center py-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-danger-50 flex items-center justify-center mb-5">
            <Shield className="w-7 h-7 text-danger-500" />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Invalid reset link</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="btn-primary inline-flex">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Request new link
          </Link>
        </div>
      </motion.div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="text-center py-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-success-50 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-7 h-7 text-success-500" />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Password reset successful</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto mb-6">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <Link to={ROUTES.AUTH.LOGIN} className="btn-primary inline-flex">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sign in
          </Link>
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
        <h1 className="text-2xl font-bold text-[#0F4C81]">Reset password</h1>
        <p className="text-text-secondary text-sm mt-1.5">
          Choose a new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
            New password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-text-muted" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              {...register('password')}
              className={clsx(
                'input-base pl-10 pr-10',
                errors.password && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
              )}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="w-full h-1.5 bg-surface-border rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-300', strength.color)}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
              <p className="text-xs text-text-muted mt-1">
                Password strength: <span className="font-medium text-text-secondary">{strength.label}</span>
              </p>
            </div>
          )}
          {errors.password && (
            <p className="mt-1.5 text-xs text-danger-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1.5">
            Confirm new password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-text-muted" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={clsx(
                'input-base pl-10 pr-10',
                errors.confirmPassword && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
              )}
              placeholder="Re-enter new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-danger-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset password'
          )}
        </button>
      </form>

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
