import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, ArrowRightLeft, Shield, Megaphone, Settings, CheckCheck,
  Mail, MailOpen, Wallet, UserCheck, Clock,
} from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { notificationService } from '@/services/notification.service';
import type { Notification } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};



const notificationTypeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  transaction: { icon: ArrowRightLeft, color: 'bg-success-50 text-success-600' },
  security: { icon: Shield, color: 'bg-warning-50 text-warning-600' },
  account: { icon: Wallet, color: 'bg-primary-50 text-primary-600' },
  promotion: { icon: Megaphone, color: 'bg-amber-50 text-amber-600' },
  system: { icon: Settings, color: 'bg-surface text-text-secondary' },
  kyc: { icon: UserCheck, color: 'bg-purple-50 text-purple-600' },
};

function NotificationIcon({ type }: { type: string }) {
  const config = notificationTypeConfig[type] || { icon: Bell, color: 'bg-surface text-text-secondary' };
  const Icon = config.icon;
  return (
    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.color)}>
      <Icon className="w-5 h-5" />
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotifications();
        if (res.data?.notifications) setNotifications(res.data.notifications);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-3xl mx-auto">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Notifications</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-secondary flex items-center gap-2">
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="card-base p-12 text-center">
            <Bell className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <h3 className="text-base font-semibold text-text mb-1">No Notifications</h3>
            <p className="text-sm text-text-muted">You\'re all caught up! New notifications will appear here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <motion.div
              key={notif.id}
              variants={itemVariants}
              onClick={() => markAsRead(notif.id)}
              className={clsx(
                'card-base p-4 cursor-pointer transition-all hover:shadow-card-hover',
                !notif.isRead && 'border-l-4 border-l-primary-500 bg-primary-50/20',
              )}
            >
              <div className="flex items-start gap-4">
                <NotificationIcon type={notif.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={clsx('text-sm', notif.isRead ? 'font-medium text-text' : 'font-semibold text-text')}>
                      {notif.title}
                    </h3>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-text-secondary">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted bg-surface px-1.5 py-0.5 rounded">
                      {notif.type}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {notif.isRead ? (
                    <MailOpen className="w-4 h-4 text-text-muted" />
                  ) : (
                    <Mail className="w-4 h-4 text-primary-500" />
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
