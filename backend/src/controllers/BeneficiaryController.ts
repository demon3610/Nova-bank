import { Response, NextFunction } from 'express';
import { RequestWithUser } from '@/types';
import BeneficiaryService from '@/services/BeneficiaryService';
import { success } from '@/utils/apiResponse';

export class BeneficiaryController {
  async add(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountNumber, ifscCode, name, nickname, bankName, transferLimit } = req.body;
      const beneficiary = await BeneficiaryService.addBeneficiary({
        userId: req.user!.userId, accountNumber, ifscCode, name, nickname, bankName, transferLimit,
      }, req);
      success(res, beneficiary, 'Beneficiary added', 201);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const beneficiaries = await BeneficiaryService.getBeneficiaries(req.user!.userId);
      success(res, beneficiaries);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const beneficiary = await BeneficiaryService.getBeneficiaryById(id, req.user!.userId);
      success(res, beneficiary);
    } catch (err) {
      next(err);
    }
  }

  async update(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { nickname, transferLimit, name, bankName } = req.body;
      const beneficiary = await BeneficiaryService.updateBeneficiary(id, req.user!.userId, {
        nickname, transferLimit, name, bankName,
      });
      success(res, beneficiary, 'Beneficiary updated');
    } catch (err) {
      next(err);
    }
  }

  async remove(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await BeneficiaryService.deleteBeneficiary(id, req.user!.userId, req);
      success(res, null, 'Beneficiary removed');
    } catch (err) {
      next(err);
    }
  }

  async verify(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const beneficiary = await BeneficiaryService.verifyBeneficiary(id, req.user!.userId);
      success(res, beneficiary, 'Beneficiary verified');
    } catch (err) {
      next(err);
    }
  }
}

export default new BeneficiaryController();
