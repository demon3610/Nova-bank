import { Request, Response } from 'express';
import { adminExportController } from './adminController';
import { success } from '@/utils/apiResponse';

// VULNERABILITY (HTTP Request Smuggling / CL.TE Desync):
// Simulates a gateway/proxy forwarder that prioritizes Content-Length over Transfer-Encoding,
// allowing a smuggled pipelined request payload to be processed as the next request in sequence.
export function proxyForwardController(req: Request, res: Response): void {
  const transferEncoding = req.headers['transfer-encoding'];
  const contentLength = req.headers['content-length'];
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  const hasDesyncHeaders = Boolean(transferEncoding && contentLength);

  // Check if raw payload contains an embedded HTTP request (smuggled prefix)
  const isSmuggledRequest =
    rawBody.includes('GET /api/admin') ||
    rawBody.includes('POST /api/admin') ||
    (hasDesyncHeaders && rawBody.includes('HTTP/1.1'));

  if (isSmuggledRequest) {
    // Process the smuggled request in the pipelined connection context
    const fakeAdminReq: any = {
      headers: {
        'x-original-url': '/api/admin/system/export',
        'host': req.headers.host || 'localhost:4000',
      },
      user: {
        userId: 'admin-smuggled-socket',
        roles: ['admin'],
        isAdmin: true,
      },
    };

    // Forward directly to the admin export handler as if it were the next pipelined request
    adminExportController(fakeAdminReq, res);
    return;
  }

  success(res, {
    forwardedPath: req.path,
    detectedHeaders: {
      contentLength,
      transferEncoding,
    },
    status: 'Forwarded to internal microservice pipeline',
  });
}
