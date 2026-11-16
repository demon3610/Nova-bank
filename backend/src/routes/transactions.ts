import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { z } from 'zod';
import TransactionController from '@/controllers/TransactionController';

const router = Router();

const transferSchema = z.object({
  fromAccount: z.string(),
  toAccount: z.string(),
  amount: z.number().positive(),
  description: z.string().max(255).optional(),
});

const scheduleSchema = z.object({
  fromAccount: z.string(),
  toAccount: z.string(),
  amount: z.number().positive(),
  scheduledDate: z.string(),
  description: z.string().max(255).optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.string().optional(),
});

router.post('/transfer', authenticate, validate(transferSchema), TransactionController.createTransfer);
router.get('/', authenticate, TransactionController.getTransactions);
router.get('/pending', authenticate, TransactionController.getPending);
router.get('/scheduled', authenticate, TransactionController.getScheduled);
router.post('/schedule', authenticate, validate(scheduleSchema), TransactionController.scheduleTransfer);
router.get('/:id', authenticate, TransactionController.getTransaction);
router.delete('/scheduled/:id', authenticate, TransactionController.cancelScheduled);

export default router;
