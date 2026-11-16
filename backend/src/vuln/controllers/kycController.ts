import { Response } from 'express';
import { RequestWithUser } from '@/types';
import { usersDb } from '@/database';
import { success, error } from '@/utils/apiResponse';

export function kycController(req: RequestWithUser, res: Response): void {
  const targetUserId = req.body.userId || req.user?.userId;
  if (!targetUserId) {
    error(res, 'Target userId is required', 400);
    return;
  }

  const user = usersDb.findById(targetUserId);
  if (!user) {
    error(res, 'User record not found', 404);
    return;
  }

  // VULNERABILITY (Mass Assignment / Over-posting):
  // The controller merges the full request body directly into the user object without schema whitelisting.
  // Attackers can inject: kycStatus: "verified", creditLimit: 500000, roles: ["admin"], etc.
  const mergedUserData = {
    ...user,
    ...req.body,
    id: user.id, // Prevent altering immutable primary key
    kycUpdatedAt: new Date().toISOString(),
  };

  const updatedUser = usersDb.update(user.id, mergedUserData);

  success(res, {
    userId: updatedUser?.id,
    email: updatedUser?.email,
    kycStatus: (updatedUser as any)?.kycStatus,
    creditLimit: (updatedUser as any)?.creditLimit,
    roles: updatedUser?.roles,
    profile: updatedUser,
  }, 'KYC application submitted and processed');
}
