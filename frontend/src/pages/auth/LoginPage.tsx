import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { ROUTES } from '@/constants';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login({ email: data.email, password: data.password });
      toast.success('Welcome back to NovaBank');
      navigate(ROUTES.DASHBOARD.HOME, { replace: true });
    } catch {
      toast.error('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#0F4C81]">Welcome back</h1>
        <p className="text-text-secondary text-sm mt-1.5">
          Sign in to your NovaBank account
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-text-muted" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className={clsx(
                'input-base pl-10 pr-10',
                errors.password && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
              )}
              placeholder="Enter your password"
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
          {errors.password && (
            <p className="mt-1.5 text-xs text-danger-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-4 h-4 rounded border-surface-border text-primary-800 focus:ring-primary-500 cursor-pointer"
            />
            <span className="text-sm text-text-secondary group-hover:text-text transition-colors">
              Remember me
            </span>
          </label>
          <Link
            to={ROUTES.AUTH.FORGOT_PASSWORD}
            className="text-sm font-medium text-primary-800 hover:text-primary-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface-card px-3 text-text-muted">or</span>
        </div>
      </div>

      <p className="text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link
          to={ROUTES.AUTH.REGISTER}
          className="font-medium text-primary-800 hover:text-primary-700 transition-colors"
        >
          Create account
        </Link>
      </p>
    </motion.div>
  );
}
