import { Router } from 'express';
import { transferFastController } from './controllers/transferController';
import { tokenController } from './controllers/tokenController';
import { beneficiaryApproveController } from './controllers/beneficiaryController';
import { webhookController } from './controllers/webhookController';
import { profileSettingsController } from './controllers/profileController';
import { pdfStatementController } from './controllers/pdfController';
import { resetPasswordController } from './controllers/resetController';
import { adminExportController } from './controllers/adminController';
import { kycController } from './controllers/kycController';
import { templatePreviewController } from './controllers/templateController';
import { avatarUploadController } from './controllers/uploadController';
import { proxyForwardController } from './controllers/proxyController';
import { redirectController } from './controllers/redirectController';

const router = Router();

// Vulnerability #01: Asynchronous Race Condition (TOCTOU)
router.post('/transactions/transfer-fast', transferFastController);

// Vulnerability #02: JWT Algorithm Confusion (RS256 -> HS256)
router.get('/auth/public-key', tokenController.getPublicKey);
router.post('/auth/token/refresh-algo', tokenController.refresh);

// Vulnerability #03: Multi-Stage IDOR with Nested Parameter Pollution
router.post('/beneficiaries/:id/approve', beneficiaryApproveController);

// Vulnerability #04: Blind SSRF with DNS Exfiltration
router.post('/notifications/webhook', webhookController);

// Vulnerability #05: Prototype Pollution in User Settings
router.patch('/users/profile/settings', profileSettingsController);

// Vulnerability #06: Second-Order HTML/PDF Injection
router.get('/statements/pdf', pdfStatementController);

// Vulnerability #07: Weak PRNG in Password Reset Tokens
router.post('/auth/reset-password-token', resetPasswordController.requestReset);
router.post('/auth/reset-password-confirm', resetPasswordController.confirmReset);

// Vulnerability #08: Reverse-Proxy Path Normalization Bypass
router.get('/admin/system/export', adminExportController);

// Vulnerability #09: Mass Assignment in Multi-Step KYC
router.post('/employees/kyc', kycController);

// Vulnerability #10: Server-Side Template Injection (SSTI)
router.post('/notifications/preview-custom', templatePreviewController);

// Vulnerability #11: Polyglot Image-SVG Stored XSS
router.post('/users/profile/upload', avatarUploadController.upload);
router.get('/users/avatar/:filename', avatarUploadController.serveAvatar);

// Vulnerability #12: HTTP Request Smuggling (CL.TE Desync)
router.post('/proxy/forward', proxyForwardController);

// Vulnerability #13: Client-Side Desync via CRLF Injection
router.get('/utils/redirect', redirectController);

export default router;
