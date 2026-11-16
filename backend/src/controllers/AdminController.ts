import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '@/repositories/UserRepository';
import { usersDb, employeesDb, rolesDb, auditLogsDb, accountsDb, transactionsDb } from '@/database';
import { success, paginated } from '@/utils/apiResponse';
import { AppError } from '@/middlewares/errorHandler';
import { logAction } from '@/middlewares/audit';

function textSearch(items: any[], fields: string[], query: string): any[] {
  const lower = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => String(item[field] || '').toLowerCase().includes(lower))
  );
}

export class AdminController {
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      let users = UserRepository.findAll();

      if (req.query.kycStatus) {
        users = users.filter((u) => u.kycStatus === req.query.kycStatus);
      }
      if (req.query.isActive !== undefined) {
        users = users.filter((u) => u.isActive === (req.query.isActive === 'true'));
      }
      if (req.query.search) {
        users = textSearch(users, ['email', 'firstName', 'lastName'], req.query.search as string);
      }

      users.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const total = users.length;
      const start = (page - 1) * limit;
      const paged = users.slice(start, start + limit);

      paginated(res, paged, { page, limit, total });
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = UserRepository.findById(req.params.id);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      const roles = user.roles.map((roleId) => rolesDb.findById(roleId)).filter(Boolean);
      success(res, { ...user, roles });
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updates = req.body;
      delete updates.password;
      delete updates.email;

      const user = UserRepository.update(req.params.id, updates);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      await logAction(req as unknown as Request, {
        action: 'admin_action',
        resource: 'User',
        resourceId: user.id,
        severity: 'medium',
        details: { updates: Object.keys(updates) },
      } as any);

      success(res, user, 'User updated');
    } catch (err) {
      next(err);
    }
  }

  async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = UserRepository.findById(req.params.id);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const updated = UserRepository.update(user.id, { isActive: !user.isActive });

      await logAction(req as any, {
        action: 'admin_action',
        resource: 'User',
        resourceId: user.id,
        severity: 'medium',
        details: { isActive: !user.isActive },
      } as any);

      success(res, updated, `User ${updated!.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      next(err);
    }
  }

  async getEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      let employees = employeesDb.findAll();
      employees.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      const enriched = employees.map((emp) => ({
        ...emp,
        userId: usersDb.findById(emp.userId),
        role: rolesDb.findById(emp.role),
      }));
      const total = employees.length;
      const start = (page - 1) * limit;
      const paged = enriched.slice(start, start + limit);

      paginated(res, paged, { page, limit, total });
    } catch (err) {
      next(err);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, department, designation, role, permissions } = req.body;
      const existing = employeesDb.findOne((e) => e.userId === userId);
      if (existing) {
        throw new AppError('User is already an employee', 409, 'ALREADY_EMPLOYEE');
      }

      const employee = employeesDb.create({
        employeeId: `EMP${Date.now()}${Math.floor(Math.random() * 1000)}`,
        userId, department, designation, role, permissions: permissions || [], isActive: true, joinedAt: new Date().toISOString(),
      });

      await logAction(req as any, {
        action: 'employee_action',
        resource: 'Employee',
        resourceId: employee.id,
        severity: 'medium',
        details: { type: 'employee_created', department, designation },
      } as any);

      success(res, employee, 'Employee created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updates = req.body;
      const employee = employeesDb.update(req.params.id, updates);
      if (!employee) {
        throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
      }
      success(res, employee, 'Employee updated');
    } catch (err) {
      next(err);
    }
  }

  async deactivateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = employeesDb.update(req.params.id, { isActive: false });
      if (!employee) {
        throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
      }

      await logAction(req as any, {
        action: 'employee_action',
        resource: 'Employee',
        resourceId: employee.id,
        severity: 'medium',
        details: { type: 'employee_deactivated' },
      } as any);

      success(res, employee, 'Employee deactivated');
    } catch (err) {
      next(err);
    }
  }

  async getRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = rolesDb.findAll();
      roles.sort((a, b) => a.name.localeCompare(b.name));
      success(res, roles);
    } catch (err) {
      next(err);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, permissions } = req.body;
      const role = rolesDb.create({ name, description, permissions, isSystem: false });
      success(res, role, 'Role created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const role = rolesDb.findById(id);
      if (!role) {
        throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
      }
      if (role.isSystem) {
        throw new AppError('Cannot modify system roles', 403, 'SYSTEM_ROLE');
      }

      const updated = rolesDb.update(id, req.body);
      success(res, updated, 'Role updated');
    } catch (err) {
      next(err);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = rolesDb.findById(req.params.id);
      if (!role) {
        throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
      }
      if (role.isSystem) {
        throw new AppError('Cannot delete system roles', 403, 'SYSTEM_ROLE');
      }

      rolesDb.delete(req.params.id);
      success(res, null, 'Role deleted');
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      let logs = auditLogsDb.findAll();

      if (req.query.action) logs = logs.filter((l) => l.action === req.query.action);
      if (req.query.severity) logs = logs.filter((l) => l.severity === req.query.severity);
      if (req.query.actorId) logs = logs.filter((l) => l.actorId === req.query.actorId);

      logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const total = logs.length;
      const start = (page - 1) * limit;
      const paged = logs.slice(start, start + limit);

      paginated(res, paged, { page, limit, total });
    } catch (err) {
      next(err);
    }
  }

  async getSystemConfig(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = {
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5'),
        sessionExpiryHours: parseInt(process.env.SESSION_EXPIRY_HOURS || '24'),
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      };
      success(res, config);
    } catch (err) {
      next(err);
    }
  }

  async updateSystemConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allowed = ['OTP_EXPIRY_MINUTES', 'SESSION_EXPIRY_HOURS', 'RATE_LIMIT_WINDOW_MS', 'RATE_LIMIT_MAX'];
      const updates = req.body;
      const updated: Record<string, string> = {};

      for (const key of Object.keys(updates)) {
        if (allowed.includes(key)) {
          process.env[key] = String(updates[key]);
          updated[key] = String(updates[key]);
        }
      }

      await logAction(req as any, {
        action: 'admin_action',
        resource: 'SystemConfig',
        severity: 'critical',
        details: { updates: updated },
      } as any);

      success(res, updated, 'Config updated');
    } catch (err) {
      next(err);
    }
  }

  async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allUsers = UserRepository.findAll();
      const allAccounts = accountsDb.findAll();
      const allTransactions = transactionsDb.findAll();

      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter((u) => u.isActive).length;
      const totalAccounts = allAccounts.length;
      const totalTransactions = allTransactions.length;
      const pendingTransactions = allTransactions.filter((t) => t.status === 'pending').length;
      const flaggedTransactions = allTransactions.filter((t) => t.status === 'flagged').length;
      const pendingKyc = allUsers.filter((u) => u.kycStatus === 'pending').length;
      const frozenAccounts = allAccounts.filter((a) => a.status === 'frozen').length;

      success(res, {
        totalUsers,
        activeUsers,
        totalAccounts,
        totalTransactions,
        pendingTransactions,
        flaggedTransactions,
        pendingKyc,
        frozenAccounts,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AdminController();
