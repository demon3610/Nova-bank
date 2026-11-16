import type { ElementType, ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mb-4">
        {Icon ? <Icon className="w-7 h-7 text-text-muted" /> : <Inbox className="w-7 h-7 text-text-muted" />}
      </div>
      <h3 className="text-base font-semibold text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-xs">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-4 btn-primary text-sm">
          {action.label}
        </button>
      )}
      {children}
    </div>
  );
}
