import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { sensitiveLimiter } from '@/middlewares/rateLimiter';
import { validate } from '@/middlewares/validate';
import { z } from 'zod';
import BeneficiaryController from '@/controllers/BeneficiaryController';

const router = Router();

const addBeneficiarySchema = z.object({
  accountNumber: z.string().min(1).max(50),
  ifscCode: z.string().min(8).max(20),
  name: z.string().min(1).max(200),
  nickname: z.string().max(100).optional(),
  bankName: z.string().min(1).max(200),
  transferLimit: z.number().positive().optional(),
});

router.post('/', authenticate, sensitiveLimiter, validate(addBeneficiarySchema), BeneficiaryController.add);
router.get('/', authenticate, BeneficiaryController.getAll);
router.get('/:id', authenticate, BeneficiaryController.getById);
router.put('/:id', authenticate, BeneficiaryController.update);
router.delete('/:id', authenticate, BeneficiaryController.remove);
router.post('/:id/verify', authenticate, BeneficiaryController.verify);

export default router;
