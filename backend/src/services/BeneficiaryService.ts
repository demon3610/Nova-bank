import { beneficiariesDb } from '@/database';
import { AppError } from '@/middlewares/errorHandler';
import { logAction } from '@/middlewares/audit';
import { Request } from 'express';

export class BeneficiaryService {
  async addBeneficiary(data: {
    userId: string;
    accountNumber: string;
    ifscCode: string;
    name: string;
    nickname?: string;
    bankName: string;
    transferLimit?: number;
  }, req: Request) {
    const existing = beneficiariesDb.findOne((b) =>
      b.userId === data.userId &&
      b.accountNumber === data.accountNumber &&
      b.ifscCode === data.ifscCode
    );

    if (existing) {
      throw new AppError('Beneficiary already exists', 409, 'BENEFICIARY_EXISTS');
    }

    const beneficiary = beneficiariesDb.create({
      userId: data.userId,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      name: data.name,
      nickname: data.nickname || '',
      bankName: data.bankName,
      transferLimit: data.transferLimit || 0,
      isVerified: false,
      status: 'active',
    });

    await logAction(req, {
      action: 'beneficiary_added',
      resource: 'Beneficiary',
      resourceId: beneficiary.id,
      severity: 'medium',
      details: { accountNumber: data.accountNumber, bankName: data.bankName },
    });

    return beneficiary;
  }

  async getBeneficiaries(userId: string) {
    const beneficiaries = beneficiariesDb.findMany((b) => b.userId === userId && b.status === 'active');
    beneficiaries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return beneficiaries;
  }

  async getBeneficiaryById(id: string, userId: string) {
    const beneficiary = beneficiariesDb.findOne((b) => b.id === id && b.userId === userId);
    if (!beneficiary) {
      throw new AppError('Beneficiary not found', 404, 'BENEFICIARY_NOT_FOUND');
    }
    return beneficiary;
  }

  async updateBeneficiary(id: string, userId: string, data: Partial<{
    nickname: string;
    transferLimit: number;
    name: string;
    bankName: string;
  }>) {
    const beneficiary = beneficiariesDb.findOne((b) => b.id === id && b.userId === userId);
    if (!beneficiary) {
      throw new AppError('Beneficiary not found', 404, 'BENEFICIARY_NOT_FOUND');
    }

    const updateData: Record<string, unknown> = {};
    if (data.nickname !== undefined) updateData.nickname = data.nickname;
    if (data.transferLimit !== undefined) updateData.transferLimit = data.transferLimit;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.bankName !== undefined) updateData.bankName = data.bankName;

    return beneficiariesDb.update(id, updateData);
  }

  async deleteBeneficiary(id: string, userId: string, req: Request) {
    const beneficiary = beneficiariesDb.findOne((b) => b.id === id && b.userId === userId);
    if (!beneficiary) {
      throw new AppError('Beneficiary not found', 404, 'BENEFICIARY_NOT_FOUND');
    }

    beneficiariesDb.update(id, { status: 'blocked' });

    await logAction(req, {
      action: 'beneficiary_added',
      resource: 'Beneficiary',
      resourceId: id,
      severity: 'low',
      details: { type: 'beneficiary_removed' },
    });

    return beneficiariesDb.findById(id);
  }

  async verifyBeneficiary(id: string, userId: string) {
    const beneficiary = beneficiariesDb.findOne((b) => b.id === id && b.userId === userId);
    if (!beneficiary) {
      throw new AppError('Beneficiary not found', 404, 'BENEFICIARY_NOT_FOUND');
    }

    return beneficiariesDb.update(id, { isVerified: true });
  }
}

export default new BeneficiaryService();
