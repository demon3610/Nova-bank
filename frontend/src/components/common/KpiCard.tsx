import type { ElementType } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: ElementType;
  variant?: 'compact' | 'full';
}

export default function KpiCard({
  label,
  value,
  change,
  changeType,
  icon: Icon,
  variant = 'full',
}: KpiCardProps) {
  if (variant === 'compact') {
    return (
      <div className="card-base p-4 hover:shadow-card-hover transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-text-secondary font-medium">{label}</p>
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-bold text-text">{value}</p>
          {change != null && changeType && (
            <span
              className={clsx(
                'inline-flex items-center gap-0.5 text-[11px] font-medium',
                changeType === 'increase' ? 'text-success-600' : 'text-danger-600',
              )}
            >
              {changeType === 'increase' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card-base p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-gray-500" />
            </div>
          )}
          <div>
            <p className="text-sm text-text-secondary font-medium">{label}</p>
            <p className="text-2xl font-bold text-text mt-0.5">{value}</p>
          </div>
        </div>
        {change != null && changeType && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full',
              changeType === 'increase' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600',
            )}
          >
            {changeType === 'increase' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}
