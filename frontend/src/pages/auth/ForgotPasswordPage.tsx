import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { ROUTES } from '@/constants';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
    } catch {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2 className="text-xl font-bold text-text mb-2">Check your email</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </p>
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="btn-primary mt-6 inline-flex"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
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
        <h1 className="text-2xl font-bold text-[#0F4C81]">Forgot password?</h1>
        <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="w-4 h-4 text-text-muted" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              {...register('email')}
              className={clsx(
                'input-base pl-10',
                errors.email && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
              )}
              placeholder="name@company.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-danger-500">{errors.email.message}</p>
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
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send reset link
            </>
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
