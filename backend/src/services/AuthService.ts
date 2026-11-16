import { config } from '@/config';
import { UserRepository } from '@/repositories/UserRepository';
import { sessionsDb, otpTokensDb, accountsDb } from '@/database';
import { generateAccountNumber } from '@/utils/helpers';
import { hashPassword, comparePassword } from '@/security/password';
import { generateTokenPair, verifyRefreshToken } from '@/security/jwt';
import { hashData, generateOTP } from '@/security/crypto';
import { AppError } from '@/middlewares/errorHandler';
import { logAction } from '@/middlewares/audit';
import { Request } from 'express';
import { JwtPayload } from '@/types';
import dayjs from 'dayjs';

export class AuthService {
  async register(data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    address?: Record<string, string>;
  }, req?: Request, ipAddress?: string, userAgent?: string) {
    const existingUser = UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const existingPhone = UserRepository.findByPhone(data.phone);
    if (existingPhone) {
      throw new AppError('Phone already registered', 409, 'PHONE_EXISTS');
    }

    const user = UserRepository.create({
      email: data.email,
      phone: data.phone,
      password: await hashPassword(data.password),
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      address: {
        street: data.address?.street || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        postalCode: data.address?.postalCode || '',
        country: data.address?.country || '',
      },
      kycStatus: 'pending',
      isActive: true,
      isLocked: false,
      failedLoginAttempts: 0,
      roles: ['role-user'],
    });

    const accountNumber = generateAccountNumber();
    accountsDb.create({
      accountNumber,
      userId: user.id,
      type: 'savings',
      balance: 0,
      currency: 'INR',
      status: 'active',
      branchCode: 'BR001',
      ifscCode: 'NOVA0000001',
      openedAt: new Date().toISOString(),
    });

    if (req) {
      await logAction(req, {
        action: 'registration',
        resource: 'User',
        resourceId: user.id,
        severity: 'low',
        details: { type: 'account_created_on_register', accountNumber },
      });
    }

    const payload: Omit<JwtPayload, 'type'> = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    };
    const tokens = generateTokenPair(payload);
    const sessionExpiry = dayjs().add(config.session.expiryHours, 'hour').toISOString();

    const hashedToken = hashData(tokens.accessToken);
    const hashedRefreshToken = hashData(tokens.refreshToken);

    sessionsDb.create({
      userId: user.id,
      token: hashedToken,
      refreshToken: hashedRefreshToken,
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
      isValid: true,
      expiresAt: sessionExpiry,
    });

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async login(email: string, password: string, ipAddress: string, userAgent: string, req: Request) {
    const user = UserRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    if (user.isLocked && user.lockUntil && user.lockUntil > new Date().toISOString()) {
      throw new AppError('Account is temporarily locked', 423, 'ACCOUNT_LOCKED');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      UserRepository.incrementFailedAttempts(user.id, user);
      const updatedUser = UserRepository.findById(user.id);
      if (updatedUser && updatedUser.failedLoginAttempts >= 5) {
        UserRepository.lockAccount(user.id);
      }
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    UserRepository.resetFailedAttempts(user.id);
    UserRepository.updateLastLogin(user.id);

    const payload: Omit<JwtPayload, 'type'> = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    };

    const tokens = generateTokenPair(payload);
    const sessionExpiry = dayjs().add(config.session.expiryHours, 'hour').toISOString();

    const hashedToken = hashData(tokens.accessToken);
    const hashedRefreshToken = hashData(tokens.refreshToken);

    sessionsDb.create({
      userId: user.id,
      token: hashedToken,
      refreshToken: hashedRefreshToken,
      ipAddress,
      userAgent,
      isValid: true,
      expiresAt: sessionExpiry,
    });

    await logAction(req, {
      action: 'login',
      resource: 'User',
      resourceId: user.id,
      severity: 'low',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      ...tokens,
    };
  }

  async logout(userId: string, accessToken: string, req: Request): Promise<void> {
    const hashedToken = hashData(accessToken);
    const sessions = sessionsDb.findMany((s) => s.userId === userId && s.token === hashedToken);
    for (const session of sessions) {
      sessionsDb.update(session.id, { isValid: false });
    }

    await logAction(req, {
      action: 'logout',
      resource: 'User',
      resourceId: userId,
      severity: 'low',
    });
  }

  async refreshToken(refreshToken: string, req: Request) {
    let decoded: JwtPayload;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const hashedRefreshToken = hashData(refreshToken);
    const session = sessionsDb.findOne((s) => s.refreshToken === hashedRefreshToken && s.isValid === true);

    if (!session) {
      throw new AppError('Refresh token revoked', 401, 'REFRESH_TOKEN_REVOKED');
    }

    const user = UserRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401, 'USER_INACTIVE');
    }

    const payload: Omit<JwtPayload, 'type'> = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    };

    const tokens = generateTokenPair(payload);
    const sessionExpiry = dayjs().add(config.session.expiryHours, 'hour').toISOString();
    const newHashedToken = hashData(tokens.accessToken);
    const newHashedRefreshToken = hashData(tokens.refreshToken);

    sessionsDb.update(session.id, {
      token: newHashedToken,
      refreshToken: newHashedRefreshToken,
      expiresAt: sessionExpiry,
    });

    await logAction(req, {
      action: 'login',
      resource: 'Session',
      resourceId: session.id,
      severity: 'low',
    });

    return tokens;
  }

  async forgotPassword(email: string, req: Request): Promise<void> {
    const user = UserRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const otp = generateOTP(6);
    const hashedOtp = await hashPassword(otp);

    otpTokensDb.create({
      identifier: email,
      otp: hashedOtp,
      type: 'forgot_password',
      attempts: 0,
      maxAttempts: 5,
      expiresAt: dayjs().add(config.otp.expiryMinutes, 'minute').toISOString(),
      isUsed: false,
    });

    await logAction(req, {
      action: 'password_change',
      resource: 'User',
      resourceId: user.id,
      severity: 'medium',
      details: { type: 'forgot_password_request' },
    });
  }

  async resetPassword(email: string, otp: string, newPassword: string, req: Request): Promise<void> {
    const otpTokens = otpTokensDb.findMany((t) =>
      t.identifier === email &&
      t.type === 'forgot_password' &&
      t.isUsed === false &&
      t.expiresAt > new Date().toISOString()
    );
    otpTokens.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const otpToken = otpTokens[0];

    if (!otpToken) {
      throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
    }

    if (otpToken.attempts >= otpToken.maxAttempts) {
      throw new AppError('OTP max attempts exceeded', 400, 'OTP_MAX_ATTEMPTS');
    }

    const isValidOtp = await comparePassword(otp, otpToken.otp);
    if (!isValidOtp) {
      otpTokensDb.update(otpToken.id, { attempts: otpToken.attempts + 1 });
      throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
    }

    otpTokensDb.update(otpToken.id, { isUsed: true });

    const user = UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const hashedNewPassword = await hashPassword(newPassword);
    UserRepository.update(user.id, { password: hashedNewPassword });

    const userSessions = sessionsDb.findMany((s) => s.userId === user.id && s.isValid === true);
    for (const session of userSessions) {
      sessionsDb.update(session.id, { isValid: false });
    }

    await logAction(req, {
      action: 'password_change',
      resource: 'User',
      resourceId: user.id,
      severity: 'high',
      details: { type: 'password_reset' },
    });
  }

  async verifyOtp(identifier: string, otp: string, type: string): Promise<boolean> {
    const otpTokens = otpTokensDb.findMany((t) =>
      t.identifier === identifier &&
      t.type === type &&
      t.isUsed === false &&
      t.expiresAt > new Date().toISOString()
    );
    otpTokens.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const otpToken = otpTokens[0];

    if (!otpToken) {
      throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
    }

    if (otpToken.attempts >= otpToken.maxAttempts) {
      throw new AppError('OTP max attempts exceeded', 400, 'OTP_MAX_ATTEMPTS');
    }

    const isValidOtp = await comparePassword(otp, otpToken.otp);
    if (!isValidOtp) {
      otpTokensDb.update(otpToken.id, { attempts: otpToken.attempts + 1 });
      throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
    }

    otpTokensDb.update(otpToken.id, { isUsed: true });
    return true;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, req: Request): Promise<void> {
    const user = UserRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const userWithPassword = UserRepository.findByEmailWithPassword(user.email);
    if (!userWithPassword) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isValidPassword = await comparePassword(currentPassword, userWithPassword.password);
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 400, 'INCORRECT_PASSWORD');
    }

    const hashedNewPassword = await hashPassword(newPassword);
    UserRepository.update(userId, { password: hashedNewPassword });

    const userSessions = sessionsDb.findMany((s) => s.userId === userId && s.isValid === true);
    for (const session of userSessions) {
      sessionsDb.update(session.id, { isValid: false });
    }

    await logAction(req, {
      action: 'password_change',
      resource: 'User',
      resourceId: userId,
      severity: 'high',
      details: { type: 'password_change' },
    });
  }
}

export default new AuthService();
