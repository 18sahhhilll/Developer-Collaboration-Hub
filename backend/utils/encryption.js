/**
 * AES-256-CBC encryption/decryption for chat messages.
 * Key must be 32 bytes (64 hex chars) stored in CHAT_ENCRYPTION_KEY env var.
 * If key is not configured, messages are stored as plain text (graceful fallback).
 *
 * Encrypted format: enc:<iv_hex>:<ciphertext_hex>
 * This prefix allows backward compatibility — plain messages are returned as-is.
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENC_PREFIX = 'enc:';

const getKey = () => {
  const key = process.env.CHAT_ENCRYPTION_KEY;
  if (!key || key.length !== 64) return null;
  return Buffer.from(key, 'hex');
};

/**
 * Encrypt a plain-text message.
 * Returns encrypted string or original text if no key configured.
 */
export const encryptMessage = (plainText) => {
  const key = getKey();
  if (!key) return plainText; // graceful fallback

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  return `${ENC_PREFIX}${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

/**
 * Decrypt an encrypted message.
 * Returns plain text. If message is not encrypted (old records), returns as-is.
 */
export const decryptMessage = (text) => {
  if (!text) return text;
  if (!text.startsWith(ENC_PREFIX)) return text; // plain text (backward compat)

  const key = getKey();
  if (!key) return text; // no key, return raw

  try {
    const rest = text.slice(ENC_PREFIX.length);
    const [ivHex, cipherHex] = rest.split(':');
    if (!ivHex || !cipherHex) return text;

    const iv = Buffer.from(ivHex, 'hex');
    const cipherText = Buffer.from(cipherHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return text; // if decryption fails return as-is
  }
};

export default { encryptMessage, decryptMessage };
