import * as crypto from 'crypto';

const KEY_VERSION = 'v1';

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY || '';
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  if (raw.length >= 32) {
    return Buffer.from(raw.slice(0, 32), 'utf8');
  }
  // Dev fallback — never use in production without ENCRYPTION_KEY
  return crypto.createHash('sha256').update(raw || 'fastpay-dev-key').digest();
}

export function encryptText(plain: string): { ciphertext: string; keyVersion: string } {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, tag, encrypted]).toString('base64');
  return { ciphertext: payload, keyVersion: KEY_VERSION };
}

export function decryptText(ciphertext: string): string {
  const key = getKey();
  const buf = Buffer.from(ciphertext, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export { KEY_VERSION };
