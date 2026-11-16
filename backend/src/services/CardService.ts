import { CardRepository } from '@/repositories/CardRepository';
import { AccountRepository } from '@/repositories/AccountRepository';
import { generateCardNumber, maskString } from '@/utils/helpers';
import { hashData } from '@/security/crypto';
import { AppError } from '@/middlewares/errorHandler';
import { logAction } from '@/middlewares/audit';
import { Request } from 'express';

export class CardService {
  async createCard(data: {
    userId: string;
    accountId: string;
    cardholderName: string;
    type: 'debit' | 'credit';
    network: 'Visa' | 'Mastercard' | 'RuPay';
    isVirtual?: boolean;
    dailyLimit?: number;
    monthlyLimit?: number;
  }, req: Request) {
    const account = AccountRepository.findById(data.accountId);
    if (!account) {
      throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
    }
    if (account.userId !== data.userId) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    const cardNumber = generateCardNumber();
    const cvv = Math.floor(100 + Math.random() * 900).toString();
    const pin = '0000';

    const existingCards = CardRepository.findByUserId(data.userId);
    if (existingCards.length >= 5) {
      throw new AppError('Maximum card limit reached', 400, 'MAX_CARDS');
    }

    const expiryMonth = new Date().getMonth() + 1;
    const expiryYear = new Date().getFullYear() + 5;

    const card = CardRepository.create({
      cardNumber: hashData(cardNumber),
      cardholderName: data.cardholderName,
      userId: data.userId,
      accountId: data.accountId,
      type: data.type,
      network: data.network,
      expiryMonth,
      expiryYear,
      cvv: hashData(cvv),
      pin: hashData(pin),
      status: 'active',
      isVirtual: data.isVirtual || false,
      dailyLimit: data.dailyLimit || 50000,
      monthlyLimit: data.monthlyLimit || 500000,
      spentToday: 0,
      spentThisMonth: 0,
      issuedAt: new Date().toISOString(),
    });

    await logAction(req, {
      action: 'admin_action',
      resource: 'Card',
      resourceId: card.id,
      severity: 'low',
      details: { type: 'card_created', cardType: data.type, network: data.network },
    });

    return {
      ...card,
      cardNumber: maskString(cardNumber.replace(/\s/g, ''), 4),
      cvv: undefined,
      pin: undefined,
    };
  }

  async getCards(userId: string) {
    const cards = CardRepository.findByUserId(userId);
    return cards.map((card) => {
      const cardNumber = card.cardNumber;
      return {
        ...card,
        cardNumber: maskString(cardNumber || '', 4),
        cvv: undefined,
        pin: undefined,
      };
    });
  }

  async getCardById(id: string, userId: string) {
    const card = CardRepository.findById(id);
    if (!card) {
      throw new AppError('Card not found', 404, 'CARD_NOT_FOUND');
    }
    if (card.userId !== userId) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }
    return {
      ...card,
      cardNumber: maskString(card.cardNumber || '', 4),
      cvv: undefined,
      pin: undefined,
    };
  }

  async freezeCard(id: string, userId: string, req: Request) {
    const card = CardRepository.findById(id);
    if (!card) {
      throw new AppError('Card not found', 404, 'CARD_NOT_FOUND');
    }
    if (card.userId !== userId) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }
    if (card.status === 'frozen') {
      throw new AppError('Card is already frozen', 400, 'ALREADY_FROZEN');
    }

    const frozen = CardRepository.freezeCard(id);
    await logAction(req, {
      action: 'card_freeze',
      resource: 'Card',
      resourceId: id,
      severity: 'high',
      details: { type: 'card_frozen', cardType: card.type },
    });

    return frozen;
  }

  async unfreezeCard(id: string, userId: string, req: Request) {
    const card = CardRepository.findById(id);
    if (!card) {
      throw new AppError('Card not found', 404, 'CARD_NOT_FOUND');
    }
    if (card.userId !== userId) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }
    if (card.status !== 'frozen') {
      throw new AppError('Card is not frozen', 400, 'NOT_FROZEN');
    }

    const unfrozen = CardRepository.unfreezeCard(id);
    await logAction(req, {
      action: 'card_freeze',
      resource: 'Card',
      resourceId: id,
      severity: 'high',
      details: { type: 'card_unfrozen' },
    });

    return unfrozen;
  }

  async replaceCard(id: string, userId: string, req: Request) {
    const card = CardRepository.findById(id);
    if (!card) {
      throw new AppError('Card not found', 404, 'CARD_NOT_FOUND');
    }
    if (card.userId !== userId) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    const newCardNumber = hashData(generateCardNumber());
    const newCvv = hashData(Math.floor(100 + Math.random() * 900).toString());
    const newExpiryMonth = new Date().getMonth() + 1;
    const newExpiryYear = new Date().getFullYear() + 5;

    const replaced = CardRepository.replaceCard(id, {
      cardNumber: newCardNumber,
      cvv: newCvv,
      expiryMonth: newExpiryMonth,
      expiryYear: newExpiryYear,
      spentToday: 0,
      spentThisMonth: 0,
    });

    await logAction(req, {
      action: 'card_freeze',
      resource: 'Card',
      resourceId: id,
      severity: 'high',
      details: { type: 'card_replaced' },
    });

    return replaced;
  }

  async updatePin(id: string, userId: string, _currentPin: string, newPin: string, req: Request) {
    const card = CardRepository.findById(id);
    if (!card) {
      throw new AppError('Card not found', 404, 'CARD_NOT_FOUND');
    }
    if (card.userId !== userId) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    const hashedNewPin = hashData(newPin);
    const updated = CardRepository.updatePin(id, hashedNewPin);

    await logAction(req, {
      action: 'card_freeze',
      resource: 'Card',
      resourceId: id,
      severity: 'medium',
      details: { type: 'pin_changed' },
    });

    return updated;
  }

  async updateLimit(id: string, userId: string, dailyLimit?: number, monthlyLimit?: number, req?: Request) {
    const card = CardRepository.findById(id);
    if (!card) {
      throw new AppError('Card not found', 404, 'CARD_NOT_FOUND');
    }
    if (card.userId !== userId) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    const updateData: Record<string, unknown> = {};
    if (dailyLimit !== undefined) updateData.dailyLimit = dailyLimit;
    if (monthlyLimit !== undefined) updateData.monthlyLimit = monthlyLimit;

    const updated = CardRepository.update(id, updateData);

    if (req) {
      await logAction(req, {
        action: 'card_freeze',
        resource: 'Card',
        resourceId: id,
        severity: 'medium',
        details: { type: 'limit_changed', ...updateData },
      });
    }

    return updated;
  }

  async getCardSpending(id: string, userId: string) {
    const card = CardRepository.findById(id);
    if (!card) {
      throw new AppError('Card not found', 404, 'CARD_NOT_FOUND');
    }
    if (card.userId !== userId) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    return {
      spentToday: card.spentToday,
      spentThisMonth: card.spentThisMonth,
      dailyLimit: card.dailyLimit,
      monthlyLimit: card.monthlyLimit,
      dailyRemaining: card.dailyLimit - card.spentToday,
      monthlyRemaining: card.monthlyLimit - card.spentThisMonth,
    };
  }
}

export default new CardService();
