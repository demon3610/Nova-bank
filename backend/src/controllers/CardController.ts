import { Response, NextFunction } from 'express';
import { RequestWithUser } from '@/types';
import CardService from '@/services/CardService';
import { success } from '@/utils/apiResponse';

export class CardController {
  async createCard(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountId, cardholderName, type, network, isVirtual, dailyLimit, monthlyLimit } = req.body;
      const card = await CardService.createCard({
        userId: req.user!.userId, accountId, cardholderName, type, network, isVirtual, dailyLimit, monthlyLimit,
      }, req);
      success(res, card, 'Card created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getCards(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const cards = await CardService.getCards(req.user!.userId);
      success(res, cards);
    } catch (err) {
      next(err);
    }
  }

  async getCard(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const card = await CardService.getCardById(id, req.user!.userId);
      success(res, card);
    } catch (err) {
      next(err);
    }
  }

  async freezeCard(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const card = await CardService.freezeCard(id, req.user!.userId, req);
      success(res, card, 'Card frozen');
    } catch (err) {
      next(err);
    }
  }

  async unfreezeCard(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const card = await CardService.unfreezeCard(id, req.user!.userId, req);
      success(res, card, 'Card unfrozen');
    } catch (err) {
      next(err);
    }
  }

  async replaceCard(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const card = await CardService.replaceCard(id, req.user!.userId, req);
      success(res, card, 'Card replaced');
    } catch (err) {
      next(err);
    }
  }

  async updatePin(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { currentPin, newPin } = req.body;
      const card = await CardService.updatePin(id, req.user!.userId, currentPin, newPin, req);
      success(res, card, 'PIN updated');
    } catch (err) {
      next(err);
    }
  }

  async updateLimit(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { dailyLimit, monthlyLimit } = req.body;
      const card = await CardService.updateLimit(id, req.user!.userId, dailyLimit, monthlyLimit, req);
      success(res, card, 'Limit updated');
    } catch (err) {
      next(err);
    }
  }

  async getSpending(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const spending = await CardService.getCardSpending(id, req.user!.userId);
      success(res, spending);
    } catch (err) {
      next(err);
    }
  }
}

export default new CardController();
