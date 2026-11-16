import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import type { LoginPayload, RegisterPayload } from '@/types';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setAuthenticated, setLoading, logout: storeLogout, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const response = await authService.login(payload);
      const { user: userData, accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      setAuthenticated(true);
      toast.success('Welcome back!');
      return response;
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setAuthenticated, setLoading]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const response = await authService.register(payload);
      const { user: userData, accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      setAuthenticated(true);
      toast.success('Account created successfully!');
      return response;
    } catch (error) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setAuthenticated, setLoading]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors
    } finally {
      storeLogout();
      toast.success('Logged out successfully');
    }
  }, [storeLogout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
}
