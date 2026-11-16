import type { ReactNode } from 'react';
import clsx from 'clsx';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type StatusSize = 'sm' | 'md';

interface StatusBadgeProps {
  variant?: StatusVariant;
  size?: StatusSize;
  icon?: ReactNode;
  dot?: boolean;
  children: ReactNode;
}

const variantClasses: Record<StatusVariant, string> = {
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  danger: 'bg-danger-50 text-danger-700 border-danger-200',
  info: 'bg-primary-50 text-primary-700 border-primary-200',
  neutral: 'bg-surface text-text-muted border-surface-border',
};

const dotColors: Record<StatusVariant, string> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-primary-500',
  neutral: 'bg-text-muted',
};

const sizeClasses: Record<StatusSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function StatusBadge({
  variant = 'neutral',
  size = 'md',
  icon,
  dot = false,
  children,
}: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variantClasses[variant],
        sizeClasses[size],
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {icon && <span className="w-3.5 h-3.5 flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
