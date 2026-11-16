import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '@/security/jwt';
import { RSA_PUBLIC_KEY } from '@/vuln/keys';
import { RequestWithUser } from '@/types';
import { error } from '@/utils/apiResponse';
import { usersDb, devicesDb } from '@/database';

export function authenticate(req: RequestWithUser, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      error(res, 'Authentication required', 401, ['No token provided']);
      return;
    }

    let decoded: any;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      // VULNERABILITY (JWT Algorithm Confusion - RS256 -> HS256):
      // The authentication middleware falls back to checking asymmetric/algorithm-confused tokens
      // using the RSA Public Key. If the token specifies "alg": "HS256", it verifies using the
      // RSA Public Key PEM string as the HMAC secret!
      const decodedComplete = jwt.decode(token, { complete: true }) as any;
      if (decodedComplete?.header?.alg === 'HS256') {
        decoded = jwt.verify(token, RSA_PUBLIC_KEY, { algorithms: ['HS256'] });
      } else if (decodedComplete?.header?.alg === 'RS256') {
        decoded = jwt.verify(token, RSA_PUBLIC_KEY, { algorithms: ['RS256'] });
      } else {
        throw err;
      }
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles || ['user'],
    };
    next();
  } catch (err) {
    const impersonateHeader = req.headers['x-impersonate'] as string;
    if (impersonateHeader) {
      const user = usersDb.findById(impersonateHeader);
      if (user) {
        req.user = {
          userId: user.id,
          email: user.email,
          roles: user.roles || ['user'],
        };
        next();
        return;
      }
    }
    error(res, 'Invalid or expired token', 401, [(err as Error).message]);
  }
}

export function authorize(...roles: string[]) {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      error(res, 'Authentication required', 401);
      return;
    }

    if (roles.length === 0) {
      next();
      return;
    }

    const hasRole = roles.some((role) => req.user!.roles.includes(role));
    if (!hasRole) {
      error(res, 'Insufficient permissions', 403, ['Required roles: ' + roles.join(', ')]);
      return;
    }

    next();
  };
}

export function requireKycVerified(req: RequestWithUser, res: Response, next: NextFunction): void {
  if (!req.user) {
    error(res, 'Authentication required', 401);
    return;
  }

  const user = usersDb.findById(req.user.userId);
  if (!user || user.kycStatus !== 'verified') {
    error(res, 'KYC verification required', 403, ['Your KYC is not verified']);
    return;
  }
  next();
}

export function requireDeviceTrust(req: RequestWithUser, res: Response, next: NextFunction): void {
  if (!req.user) {
    error(res, 'Authentication required', 401);
    return;
  }

  const deviceId = req.headers['x-device-id'] as string;
  if (!deviceId) {
    error(res, 'Device identification required', 400, ['x-device-id header is required for this operation']);
    return;
  }

  const device = devicesDb.findOne((d: any) => d.id === deviceId && d.userId === req.user!.userId && d.isTrusted === true);
  if (!device) {
    error(res, 'Trusted device required', 403, ['This operation requires a trusted device']);
    return;
  }
  req.deviceId = deviceId;
  next();
}
