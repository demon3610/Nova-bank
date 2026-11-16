import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Shield,
  Settings,
  ScrollText,
  Activity,
  Building2,
  Menu,
} from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import NotificationBell from '@/components/layout/NotificationBell';
import UserDropdown from '@/components/layout/UserDropdown';
import { ROUTES } from '@/constants';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.ADMIN.HOME },
  { label: 'User Management', icon: Users, href: ROUTES.ADMIN.USERS },
  { label: 'Employee Management', icon: UserCog, href: ROUTES.ADMIN.EMPLOYEES },
  { label: 'Roles & Permissions', icon: Shield, href: ROUTES.ADMIN.ROLES },
  { label: 'System Config', icon: Settings, href: ROUTES.ADMIN.SETTINGS },
  { label: 'Audit Logs', icon: ScrollText, href: ROUTES.ADMIN.AUDIT_LOGS },
  { label: 'Monitoring', icon: Activity, href: ROUTES.ADMIN.SYSTEM },
];

export default function AdminLayout() {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'NA';

  const isActive = (href: string) => {
    if (href === ROUTES.ADMIN.HOME) {
      return location.pathname === ROUTES.ADMIN.HOME;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-surface-border z-50">
        <div className="flex items-center h-full px-4 lg:px-6">
          <button onClick={toggleSidebar} className="p-2 rounded-button hover:bg-surface transition-colors mr-3 lg:mr-4" aria-label="Toggle sidebar">
            <Menu className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-danger-600 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-danger-800 hidden sm:block">Nova<span className="text-danger-500">Bank</span></span>
            <span className="hidden sm:inline-flex ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-danger-50 text-danger-700 rounded-md">Admin</span>
          </div>
          <div className="flex-1" />
          <NotificationBell />
          <UserDropdown />
        </div>
      </header>

      <aside className={clsx('fixed left-0 top-14 h-[calc(100vh-56px)] bg-white border-r border-surface-border z-30 transition-all duration-300 flex flex-col', sidebarOpen ? 'w-56' : 'w-16')}>
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link to={item.href} className={clsx(
                    'relative flex items-center gap-3 px-3 py-2 rounded-button text-xs font-medium transition-colors',
                    active ? 'bg-danger-50 text-danger-700' : 'text-text-secondary hover:bg-surface hover:text-text',
                  )}>
                    {active && (
                      <motion.span
                        layoutId="admin-sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-danger-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className={clsx('whitespace-nowrap transition-opacity duration-200', sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden')}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={clsx('border-t border-surface-border p-2.5', !sidebarOpen && 'px-2')}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-danger-100 flex items-center justify-center text-danger-800 text-[10px] font-semibold flex-shrink-0">{initials}</div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-text truncate">{user ? `${user.firstName} ${user.lastName}` : 'Admin'}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={clsx('pt-14 min-h-screen transition-all duration-300', sidebarOpen ? 'lg:ml-56' : 'lg:ml-16')}
      >
        <div className="p-3 sm:p-4 lg:p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
