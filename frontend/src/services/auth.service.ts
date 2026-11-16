import { get, post, put } from './api';
import type {
  ApiResponse,
  User,
  LoginPayload,
  RegisterPayload,
} from '@/types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface Device {
  id: string;
  name: string;
  type: string;
  isTrusted: boolean;
  lastUsed: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    post<ApiResponse<AuthResponse>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    post<ApiResponse<AuthResponse>>('/auth/register', payload),

  logout: () => post<ApiResponse<null>>('/auth/logout'),

  refreshToken: () => post<ApiResponse<AuthResponse>>('/auth/refresh'),

  forgotPassword: (email: string) =>
    post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    post<ApiResponse<null>>('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) =>
    post<ApiResponse<null>>('/auth/verify-email', { token }),

  changePassword: (currentPassword: string, newPassword: string) =>
    put<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword }),

  getSessions: () => get<ApiResponse<Session[]>>('/auth/sessions'),

  revokeSession: (id: string) =>
    post<ApiResponse<null>>(`/auth/sessions/${id}/revoke`),

  getDevices: () => get<ApiResponse<Device[]>>('/auth/devices'),

  trustDevice: (id: string) =>
    post<ApiResponse<null>>(`/auth/devices/${id}/trust`),

  removeDevice: (id: string) =>
    post<ApiResponse<null>>(`/auth/devices/${id}/remove`),
};
