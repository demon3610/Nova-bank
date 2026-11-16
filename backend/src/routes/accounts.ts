import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { z } from 'zod';
import AccountController from '@/controllers/AccountController';

const router = Router();

const createAccountSchema = z.object({
  type: z.enum(['savings', 'current']),
  branchCode: z.string().min(4).max(20).optional(),
  ifscCode: z.string().min(8).max(20).optional(),
  currency: z.string().optional(),
});

const depositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

router.post('/', authenticate, validate(createAccountSchema), AccountController.createAccount);
router.get('/', authenticate, AccountController.getAccounts);
router.get('/:id', authenticate, AccountController.getAccount);
router.put('/:id', authenticate, AccountController.updateAccount);
router.get('/number/:accountNumber', authenticate, AccountController.getAccountByNumber);
router.post('/:id/freeze', authenticate, AccountController.freezeAccount);
router.post('/:id/unfreeze', authenticate, AccountController.unfreezeAccount);
router.post('/:id/deposit', authenticate, validate(depositSchema), AccountController.deposit);
router.get('/:id/statement', authenticate, AccountController.getStatement);
router.get('/:id/statement/download', authenticate, AccountController.downloadStatementPdf);

export default router;
