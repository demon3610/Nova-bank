import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import EmployeeLayout from '@/layouts/EmployeeLayout';
import AdminLayout from '@/layouts/AdminLayout';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import OtpVerificationPage from '@/pages/auth/OtpVerificationPage';

import DashboardPage from '@/pages/dashboard/DashboardPage';
import AccountsPage from '@/pages/dashboard/AccountsPage';
import AccountDetailPage from '@/pages/dashboard/AccountDetailPage';
import TransactionsPage from '@/pages/dashboard/TransactionsPage';
import TransferPage from '@/pages/dashboard/TransferPage';
import CardsPage from '@/pages/dashboard/CardsPage';
import BeneficiariesPage from '@/pages/dashboard/BeneficiariesPage';
import NotificationsPage from '@/pages/dashboard/NotificationsPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';

import EmployeeDashboard from '@/pages/employee/EmployeeDashboard';
import CustomerLookup from '@/pages/employee/CustomerLookup';
import KycReviewPage from '@/pages/employee/KycReviewPage';
import TransactionReview from '@/pages/employee/TransactionReview';
import CardManagement from '@/pages/employee/CardManagement';
import AuditHistory from '@/pages/employee/AuditHistory';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import RoleManagement from '@/pages/admin/RoleManagement';
import AdminAuditLogs from '@/pages/admin/AuditLogs';
import SystemConfig from '@/pages/admin/SystemConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="verify-otp" element={<OtpVerificationPage />} />
          </Route>

          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="accounts/:id" element={<AccountDetailPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transfer" element={<TransferPage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="cards/:id" element={<CardsPage />} />
            <Route path="beneficiaries" element={<BeneficiariesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<SettingsPage />} />
            <Route path="statements" element={<AccountsPage />} />
            </Route>
          </Route>

          <Route path="/employee" element={<ProtectedRoute />}>
            <Route element={<EmployeeLayout />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="customers" element={<CustomerLookup />} />
            <Route path="customers/:id" element={<CustomerLookup />} />
            <Route path="transactions" element={<TransactionReview />} />
            <Route path="approvals" element={<KycReviewPage />} />
            <Route path="cards" element={<CardManagement />} />
            <Route path="reports" element={<AuditHistory />} />
            </Route>
          </Route>

          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/:id" element={<UserManagement />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="employees" element={<UserManagement />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="settings" element={<SystemConfig />} />
            <Route path="system" element={<SystemConfig />} />
            <Route path="analytics" element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
            },
            success: {
              iconTheme: { primary: '#16A34A', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
