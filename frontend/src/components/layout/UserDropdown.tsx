import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'NA';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  const menuItems = [
    { label: 'Profile', icon: User, href: ROUTES.DASHBOARD.PROFILE },
    { label: 'Security Settings', icon: Shield, href: ROUTES.DASHBOARD.SETTINGS },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1.5 rounded-button hover:bg-surface transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-white text-xs font-semibold">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-text leading-tight">
            {user ? `${user.firstName} ${user.lastName}` : 'User'}
          </p>
          <p className="text-[11px] text-text-muted leading-tight">{user?.email}</p>
        </div>
        <ChevronDown className={clsx('w-4 h-4 text-text-muted transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-surface-card border border-surface-border rounded-card shadow-dropdown z-[60]"
          >
            <div className="px-4 py-3 border-b border-surface-border sm:hidden">
              <p className="text-sm font-medium text-text">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs text-text-muted">{user?.email}</p>
            </div>

            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface transition-colors first:rounded-t-card"
              >
                <item.icon className="w-4 h-4 text-text-secondary" />
                {item.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors rounded-b-card border-t border-surface-border"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
