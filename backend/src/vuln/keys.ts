import crypto from 'crypto';

// Generate or export RSA key pair for JWT signing and algorithm confusion testing
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

export const RSA_PUBLIC_KEY = publicKey;
export const RSA_PRIVATE_KEY = privateKey;
