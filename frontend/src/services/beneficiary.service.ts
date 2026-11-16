import { get, post, put, del } from './api';
import type { ApiResponse, Beneficiary } from '@/types';

interface AddBeneficiaryPayload {
  accountNumber: string;
  ifscCode: string;
  name: string;
  nickname?: string;
  bankName: string;
}

export const beneficiaryService = {
  getBeneficiaries: () =>
    get<ApiResponse<Beneficiary[]>>('/beneficiaries'),

  getBeneficiary: (id: string) =>
    get<ApiResponse<Beneficiary>>(`/beneficiaries/${id}`),

  addBeneficiary: (payload: AddBeneficiaryPayload) =>
    post<ApiResponse<Beneficiary>>('/beneficiaries', payload),

  updateBeneficiary: (id: string, payload: Partial<AddBeneficiaryPayload>) =>
    put<ApiResponse<Beneficiary>>(`/beneficiaries/${id}`, payload),

  deleteBeneficiary: (id: string) =>
    del<ApiResponse<null>>(`/beneficiaries/${id}`),

  verifyBeneficiary: (id: string) =>
    post<ApiResponse<Beneficiary>>(`/beneficiaries/${id}/verify`),
};
