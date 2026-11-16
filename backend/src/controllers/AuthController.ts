import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '@/types';
import AuthService from '@/services/AuthService';
import { sessionsDb, devicesDb } from '@/database';
import { success, error } from '@/utils/apiResponse';
import { config } from '@/config';

const cookieSecure = config.cookie.secure;

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, phone, password, firstName, lastName, dateOfBirth, address } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';
      const userAgent = req.headers['user-agent'] || '';
      const result = await AuthService.register({ email, phone, password, firstName, lastName, dateOfBirth, address }, req, ipAddress, userAgent);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh',
      });

      success(res, result, 'Registration successful', 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';
      const userAgent = req.headers['user-agent'] || '';
      const result = await AuthService.login(email, password, ipAddress, userAgent, req);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh',
      });

      success(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  async logout(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken || '';
      await AuthService.logout(req.user!.userId, token, req);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      success(res, null, 'Logout successful');
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
      if (!refreshToken) {
        error(res, 'Refresh token required', 400);
        return;
      }
      const tokens = await AuthService.refreshToken(refreshToken, req);

      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      success(res, tokens, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email, req);
      success(res, null, 'If the email exists, an OTP has been sent');
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;
      await AuthService.resetPassword(email, otp, newPassword, req);
      success(res, null, 'Password reset successful');
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      const verified = await AuthService.verifyOtp(email, otp, 'register');
      success(res, { verified }, 'Email verified successfully');
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user!.userId, currentPassword, newPassword, req);
      success(res, null, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  }

  async getSessions(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = sessionsDb.findMany((s) => s.userId === req.user!.userId && s.isValid === true);
      sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      const enriched = sessions.map((s) => {
        if (s.deviceId) {
          const device = devicesDb.findById(s.deviceId);
          return { ...s, deviceId: device };
        }
        return s;
      });

      success(res, enriched);
    } catch (err) {
      next(err);
    }
  }

  async revokeSession(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const session = sessionsDb.findOne((s) => s.id === id && s.userId === req.user!.userId);
      if (!session) {
        error(res, 'Session not found', 404);
        return;
      }
      sessionsDb.update(id, { isValid: false });
      success(res, null, 'Session revoked');
    } catch (err) {
      next(err);
    }
  }

  async getDevices(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const devices = devicesDb.findMany((d) => d.userId === req.user!.userId);
      devices.sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));
      success(res, devices);
    } catch (err) {
      next(err);
    }
  }

  async trustDevice(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const device = devicesDb.findOne((d) => d.id === id && d.userId === req.user!.userId);
      if (!device) {
        error(res, 'Device not found', 404);
        return;
      }
      const updated = devicesDb.update(id, { isTrusted: true });
      success(res, updated, 'Device trusted');
    } catch (err) {
      next(err);
    }
  }

  async removeDevice(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const device = devicesDb.findOne((d) => d.id === id && d.userId === req.user!.userId);
      if (!device) {
        error(res, 'Device not found', 404);
        return;
      }
      devicesDb.delete(id);
      success(res, null, 'Device removed');
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
