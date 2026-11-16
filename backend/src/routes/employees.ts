import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth';
import EmployeeController from '@/controllers/EmployeeController';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'employee'));

// Customer lookup
router.get('/customers/lookup', EmployeeController.lookupCustomer);
router.get('/customers/:id', EmployeeController.getCustomerDetails);

// KYC
router.get('/customers/:id/kyc', EmployeeController.reviewKyc);
router.post('/customers/:id/kyc/approve', EmployeeController.approveKyc);
router.post('/customers/:id/kyc/reject', EmployeeController.rejectKyc);

// Transactions
router.get('/transactions/:id', EmployeeController.reviewTransaction);
router.post('/transactions/:id/flag', EmployeeController.flagTransaction);
router.post('/transactions/:id/clear', EmployeeController.clearTransaction);

// Accounts
router.post('/accounts/:id/freeze', EmployeeController.freezeCustomerAccount);
router.post('/accounts/:id/unfreeze', EmployeeController.unfreezeCustomerAccount);

// Cards
router.get('/customers/:id/cards', EmployeeController.getCustomerCards);
router.post('/cards/:id/manage', EmployeeController.manageCustomerCard);

// Audit
router.get('/audit/:id', EmployeeController.getAuditHistory);

export default router;
