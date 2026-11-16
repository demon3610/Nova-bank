import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { RSA_PUBLIC_KEY, RSA_PRIVATE_KEY } from '../keys';
import { success, error } from '@/utils/apiResponse';

export const tokenController = {
  getPublicKey(_req: Request, res: Response): void {
    success(res, {
      algorithm: 'RS256',
      format: 'PKCS8-PEM',
      publicKey: RSA_PUBLIC_KEY,
      note: 'Use this public key to verify NovaBank asymmetric JWT signatures.',
    });
  },

  refresh(req: Request, res: Response): void {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.body.token || req.cookies?.accessToken);

    if (!token) {
      error(res, 'No token provided', 401);
      return;
    }

    try {
      const decodedComplete = jwt.decode(token, { complete: true }) as any;
      if (!decodedComplete) {
        error(res, 'Malformed token', 400);
        return;
      }

      // Algorithm Confusion Flaw:
      // Accepts HS256 using the RSA Public Key string as the symmetric HMAC secret
      let verifiedPayload: any;
      if (decodedComplete.header.alg === 'HS256') {
        verifiedPayload = jwt.verify(token, RSA_PUBLIC_KEY, { algorithms: ['HS256'] });
      } else {
        verifiedPayload = jwt.verify(token, RSA_PUBLIC_KEY, { algorithms: ['RS256'] });
      }

      // Issue refreshed RS256 token
      const newToken = jwt.sign(
        {
          userId: verifiedPayload.userId,
          email: verifiedPayload.email,
          roles: verifiedPayload.roles || ['user'],
          type: 'access',
        },
        RSA_PRIVATE_KEY,
        { algorithm: 'RS256', expiresIn: '1h' }
      );

      success(res, {
        accessToken: newToken,
        user: {
          userId: verifiedPayload.userId,
          email: verifiedPayload.email,
          roles: verifiedPayload.roles,
        },
      }, 'Token refreshed successfully');
    } catch (err: any) {
      error(res, `Token verification failed: ${err.message}`, 401);
    }
  },
};
