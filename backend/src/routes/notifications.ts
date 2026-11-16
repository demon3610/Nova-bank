import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import NotificationController from '@/controllers/NotificationController';

const router = Router();

router.get('/', authenticate, NotificationController.getNotifications);
router.put('/:id/read', authenticate, NotificationController.markRead);
router.put('/read-all', authenticate, NotificationController.markAllRead);
router.get('/unread-count', authenticate, NotificationController.getUnreadCount);

export default router;
