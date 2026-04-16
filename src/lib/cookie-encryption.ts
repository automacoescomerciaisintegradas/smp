import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const secret = process.env.COOKIE_ENCRYPTION_KEY;
  
  if (!secret || secret.length < 32) {
    throw new Error(
      'COOKIE_ENCRYPTION_KEY não configurado ou muito curto. ' +
      'Defina uma chave com pelo menos 32 caracteres no .env'
    );
  }

  const salt = process.env.COOKIE_ENCRYPTION_SALT || 'instagram-cookie-salt';
  return scryptSync(secret, salt, KEY_LENGTH);
}

export function encryptCookie(plaintext: string): string {
  if (!plaintext) return '';

  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const salt = randomBytes(SALT_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    // Formato: salt:iv:auth_tag:encrypted
    return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Erro ao criptografar cookie:', error);
    throw new Error('Falha ao criptografar dados');
  }
}

export function decryptCookie(encryptedData: string): string {
  if (!encryptedData) return '';

  try {
    const parts = encryptedData.split(':');
    
    if (parts.length !== 4) {
      throw new Error('Formato de cookie criptografado inválido');
    }

    const [saltHex, ivHex, authTagHex, encrypted] = parts;
    
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const key = getEncryptionKey();
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar cookie:', error);
    throw new Error('Falha ao descriptografar dados');
  }
}

export function parseCookieString(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  const pairs = cookieString.split(';').map(pair => pair.trim());
  
  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split('=');
    if (key && valueParts.length > 0) {
      cookies[key.trim()] = valueParts.join('=');
    }
  }
  
  return cookies;
}

export function validateInstagramCookies(cookieString: string): {
  valid: boolean;
  missing: string[];
  present: string[];
} {
  const cookies = parseCookieString(cookieString);
  
  const requiredCookies = [
    'csrftoken',
    'sessionid',
    'ds_user_id',
    'ig_did',
    'mid',
    'datr'
  ];
  
  const missing: string[] = [];
  const present: string[] = [];
  
  for (const name of requiredCookies) {
    if (cookies[name]) {
      present.push(name);
    } else {
      missing.push(name);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    present
  };
}
