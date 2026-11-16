import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { authLimiter } from '@/middlewares/rateLimiter';
import AuthController from '@/controllers/AuthController';
import { validate } from '@/middlewares/validate';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8).max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.get('/sessions', authenticate, AuthController.getSessions);
router.delete('/sessions/:id', authenticate, AuthController.revokeSession);
router.get('/devices', authenticate, AuthController.getDevices);
router.post('/devices/:id/trust', authenticate, AuthController.trustDevice);
router.delete('/devices/:id', authenticate, AuthController.removeDevice);

export default router;
