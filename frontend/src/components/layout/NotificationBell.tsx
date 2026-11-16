import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ArrowUpRight, Shield, CreditCard, UserCheck, Megaphone, Settings, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { useUiStore } from '@/store/uiStore';
import { ROUTES } from '@/constants';
import type { Notification, NotificationType } from '@/types';

const notificationIcons: Record<NotificationType, React.ElementType> = {
  transaction: ArrowUpRight,
  security: Shield,
  account: CreditCard,
  promotion: Megaphone,
  system: Settings,
  kyc: UserCheck,
};

const notificationColors: Record<NotificationType, string> = {
  transaction: 'text-primary-600 bg-primary-50',
  security: 'text-danger-600 bg-danger-50',
  account: 'text-success-600 bg-success-50',
  promotion: 'text-warning-600 bg-warning-50',
  system: 'text-text-secondary bg-surface',
  kyc: 'text-primary-600 bg-primary-50',
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, markRead } = useUiStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-button hover:bg-surface transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 text-[10px] font-bold text-white bg-danger-500 rounded-full min-w-[18px] min-h-[18px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-card border border-surface-border rounded-card shadow-dropdown z-[60]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
              <span className="text-sm font-semibold text-text">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    notifications.forEach((n) => markRead(n.id));
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <Bell className="w-8 h-8 text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification: Notification) => {
                  const Icon = notificationIcons[notification.type] || Info;
                  const colorClass = notificationColors[notification.type] || 'text-text-secondary bg-surface';
                  return (
                    <button
                      key={notification.id}
                      onClick={() => markRead(notification.id)}
                      className={clsx(
                        'w-full text-left px-4 py-3 transition-colors hover:bg-surface border-b border-surface-border last:border-b-0',
                        !notification.isRead && 'bg-primary-50/40',
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={clsx('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center', colorClass)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={clsx('text-sm truncate', !notification.isRead ? 'font-semibold text-text' : 'text-text')}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-text-muted truncate mt-0.5">{notification.message}</p>
                          <p className="text-[11px] text-text-muted mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <Link
              to={ROUTES.DASHBOARD.NOTIFICATIONS}
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm font-medium text-primary-600 hover:text-primary-800 py-3 border-t border-surface-border transition-colors"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
