import { Request, Response } from 'express';
import { usersDb, otpTokensDb } from '@/database';
import { hashPassword } from '@/security/password';
import { success, error } from '@/utils/apiResponse';

// VULNERABILITY (Weak PRNG Token Generation):
// The 32-hex reset token is generated using a simple Linear Congruential Generator
// seeded with Math.floor(Date.now() / 1000).
// An attacker knowing when the reset request was sent can precompute the exact token for that second.
export function generatePredictableToken(secondTimestamp: number): string {
  let seed = secondTimestamp;
  let result = '';
  for (let i = 0; i < 4; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    result += seed.toString(16).padStart(8, '0');
  }
  return result;
}

export const resetPasswordController = {
  requestReset(req: Request, res: Response): void {
    const { email } = req.body;
    if (!email) {
      error(res, 'Email address is required', 400);
      return;
    }

    const user = usersDb.findOne(u => u.email === email);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = generatePredictableToken(nowSeconds);

    if (user) {
      // Store token in database with 15-minute expiration
      otpTokensDb.create({
        identifier: user.email,
        otp: token,
        type: 'forgot_password',
        attempts: 0,
        maxAttempts: 5,
        isUsed: false,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      } as any);
    }

    // Include the server response timestamp in header to facilitate synchronization
    res.setHeader('X-Server-Timestamp', nowSeconds.toString());
    success(res, {
      message: 'If the provided email corresponds to an active account, password reset instructions have been dispatched.',
      timestamp: nowSeconds,
    });
  },

  async confirmReset(req: Request, res: Response): Promise<void> {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      error(res, 'Email, token, and newPassword are required', 400);
      return;
    }

    const resetRecord = otpTokensDb.findOne(
      t => (t.identifier === email || (t as any).email === email) && (t.otp === token || (t as any).token === token) && new Date(t.expiresAt) > new Date()
    );

    if (!resetRecord) {
      error(res, 'Invalid or expired password reset token', 400);
      return;
    }

    const user = usersDb.findOne(u => u.email === email);
    if (!user) {
      error(res, 'User record not found', 404);
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    usersDb.update(user.id, { password: hashedPassword });
    otpTokensDb.delete(resetRecord.id);

    success(res, {
      email: user.email,
      userId: user.id,
      status: 'password_updated',
    }, 'Password reset confirmed. You may now log in with the new password.');
  },
};
