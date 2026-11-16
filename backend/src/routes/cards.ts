import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { z } from 'zod';
import CardController from '@/controllers/CardController';

const router = Router();

const createCardSchema = z.object({
  accountId: z.string(),
  cardholderName: z.string().min(1).max(100),
  type: z.enum(['debit', 'credit']),
  network: z.enum(['Visa', 'Mastercard', 'RuPay']),
  isVirtual: z.boolean().optional(),
  dailyLimit: z.number().positive().optional(),
  monthlyLimit: z.number().positive().optional(),
});

const updatePinSchema = z.object({
  currentPin: z.string().length(4),
  newPin: z.string().length(4),
});

const updateLimitSchema = z.object({
  dailyLimit: z.number().positive().optional(),
  monthlyLimit: z.number().positive().optional(),
});

router.post('/', authenticate, validate(createCardSchema), CardController.createCard);
router.get('/', authenticate, CardController.getCards);
router.get('/:id', authenticate, CardController.getCard);
router.post('/:id/freeze', authenticate, CardController.freezeCard);
router.post('/:id/unfreeze', authenticate, CardController.unfreezeCard);
router.post('/:id/replace', authenticate, CardController.replaceCard);
router.put('/:id/pin', authenticate, validate(updatePinSchema), CardController.updatePin);
router.put('/:id/limit', authenticate, validate(updateLimitSchema), CardController.updateLimit);
router.get('/:id/spending', authenticate, CardController.getSpending);

export default router;
