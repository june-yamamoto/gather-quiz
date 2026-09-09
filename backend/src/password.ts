import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/** OWASP推奨のscrypt設定を使い、Lambdaでもメモリ使用を32MiBに抑える。 */
export async function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key)));
}

/** 平文を保存・再表示せず、参加者ごとに異なるソルトを使う。 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${(await derive(password, salt)).toString('hex')}`;
}

/** 移行済みのハッシュのみを一定時間比較する。 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [format, salt, hash] = stored.split('$');
  if (format !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hash || '')) return false;
  return timingSafeEqual(await derive(password, salt), Buffer.from(hash, 'hex'));
}

