import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  CreditCard,
  Users,
  Bell,
  Settings,
} from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.DASHBOARD.HOME },
  { label: 'Accounts', icon: Wallet, href: ROUTES.DASHBOARD.ACCOUNTS },
  { label: 'Transactions', icon: ArrowRightLeft, href: ROUTES.DASHBOARD.TRANSACTIONS },
  { label: 'Cards', icon: CreditCard, href: ROUTES.DASHBOARD.CARDS },
  { label: 'Beneficiaries', icon: Users, href: ROUTES.DASHBOARD.BENEFICIARIES },
  { label: 'Notifications', icon: Bell, href: ROUTES.DASHBOARD.NOTIFICATIONS },
  { label: 'Settings', icon: Settings, href: ROUTES.DASHBOARD.SETTINGS },
];

export default function Sidebar() {
  const { sidebarOpen } = useUiStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'NA';

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD.HOME) {
      return location.pathname === ROUTES.DASHBOARD.HOME;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={clsx(
        'fixed left-0 top-16 h-[calc(100vh-64px)] bg-surface-card border-r border-surface-border z-30 transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-60' : 'w-16',
      )}
    >
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={clsx(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-text-secondary hover:bg-surface hover:text-text',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-800 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span
                    className={clsx(
                      'whitespace-nowrap transition-opacity duration-200',
                      sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden',
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={clsx('border-t border-surface-border p-3', !sidebarOpen && 'px-2')}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
