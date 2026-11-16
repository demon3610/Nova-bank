import { Router } from 'express';
import authRoutes from './auth';
import accountRoutes from './accounts';
import transactionRoutes from './transactions';
import cardRoutes from './cards';
import notificationRoutes from './notifications';
import beneficiaryRoutes from './beneficiaries';
import adminRoutes from './admin';
import employeeRoutes from './employees';
import vulnRoutes from '@/vuln/routes';

const router = Router();

router.use('/', vulnRoutes);
router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/cards', cardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/beneficiaries', beneficiaryRoutes);
router.use('/admin', adminRoutes);
router.use('/employees', employeeRoutes);

export default router;
