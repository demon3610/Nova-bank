import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { ROUTES } from '@/constants';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
    },
  });

  const password = watch('password');
  const strength = getPasswordStrength(password ?? '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      navigate(ROUTES.DASHBOARD.HOME, { replace: true });
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
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
        <h1 className="text-2xl font-bold text-[#0F4C81]">Create account</h1>
        <p className="text-text-secondary text-sm mt-1.5">
          Join NovaBank for enterprise-grade banking
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text mb-1.5">
              First name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-text-muted" />
              </div>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                autoFocus
                {...register('firstName')}
                className={clsx(
                  'input-base pl-10',
                  errors.firstName && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
                )}
                placeholder="John"
              />
            </div>
            {errors.firstName && (
              <p className="mt-1.5 text-xs text-danger-500">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-text mb-1.5">
              Last name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-text-muted" />
              </div>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                {...register('lastName')}
                className={clsx(
                  'input-base pl-10',
                  errors.lastName && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
                )}
                placeholder="Doe"
              />
            </div>
            {errors.lastName && (
              <p className="mt-1.5 text-xs text-danger-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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
          <label htmlFor="phone" className="block text-sm font-medium text-text mb-1.5">
            Phone number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="w-4 h-4 text-text-muted" />
            </div>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              className={clsx(
                'input-base pl-10',
                errors.phone && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
              )}
              placeholder="9876543210"
              maxLength={10}
            />
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-xs text-danger-500">{errors.phone.message}</p>
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
              autoComplete="new-password"
              {...register('password')}
              className={clsx(
                'input-base pl-10 pr-10',
                errors.password && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
              )}
              placeholder="Create a strong password"
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
            Confirm password
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
              placeholder="Re-enter your password"
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

        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            {...register('acceptTerms')}
            className="mt-0.5 w-4 h-4 rounded border-surface-border text-primary-800 focus:ring-primary-500 cursor-pointer"
          />
          <span className="text-sm text-text-secondary group-hover:text-text transition-colors leading-relaxed">
            I agree to the{' '}
            <Link to="#" className="font-medium text-primary-800 hover:text-primary-700 transition-colors">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link to="#" className="font-medium text-primary-800 hover:text-primary-700 transition-colors">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-xs text-danger-500 -mt-3">{errors.acceptTerms.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="font-medium text-primary-800 hover:text-primary-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
