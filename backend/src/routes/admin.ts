import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { z } from 'zod';
import AdminController from '@/controllers/AdminController';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

const createEmployeeSchema = z.object({
  userId: z.string(),
  department: z.string().min(1).max(100),
  designation: z.string().min(1).max(100),
  role: z.string(),
  permissions: z.array(z.string()).optional(),
});

const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()),
});

// Users
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id', AdminController.updateUser);
router.patch('/users/:id/toggle-status', AdminController.toggleUserStatus);

// Employees
router.get('/employees', AdminController.getEmployees);
router.post('/employees', validate(createEmployeeSchema), AdminController.createEmployee);
router.put('/employees/:id', AdminController.updateEmployee);
router.patch('/employees/:id/deactivate', AdminController.deactivateEmployee);

// Roles
router.get('/roles', AdminController.getRoles);
router.post('/roles', validate(createRoleSchema), AdminController.createRole);
router.put('/roles/:id', AdminController.updateRole);
router.delete('/roles/:id', AdminController.deleteRole);

// Audit
router.get('/audit-logs', AdminController.getAuditLogs);

// Config
router.get('/config', AdminController.getSystemConfig);
router.put('/config', AdminController.updateSystemConfig);

// Dashboard
router.get('/dashboard/stats', AdminController.getDashboardStats);

export default router;
