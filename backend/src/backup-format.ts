import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';

export const tableNames = ['Tournament', 'Participant', 'Quiz'] as const;
export type Tables = Record<typeof tableNames[number], Record<string, unknown>[]>;
export interface Backup { version: 1; schema: string; createdAt: string; checksum: string; tables: Tables }

/** データ破損を検出するため、保存時と復元時で同じJSONをハッシュする。 */
export function checksum(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/** 小規模大会向けの論理バックアップ。画像実体はS3のバージョニングで別途保持する。 */
export function encodeBackup(tables: Tables, schema: string): Buffer {
  return gzipSync(JSON.stringify({ version: 1, schema, createdAt: new Date().toISOString(), checksum: checksum(tables), tables }));
}

/** スキーマ不一致や破損した入力を、DBを変更する前に拒否する。 */
export function decodeBackup(bytes: Buffer, schema: string): Backup {
  let value: unknown;
  try { value = JSON.parse(gunzipSync(bytes, { maxOutputLength: 64 * 1024 * 1024 }).toString('utf8')); }
  catch { throw new Error('バックアップの圧縮データまたはJSONが不正です'); }
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('tables' in value)) {
    throw new Error('バックアップ形式が不正です');
  }
  if (!('schema' in value) || value.schema !== schema) throw new Error('バックアップのスキーマが一致しません');
  const tables = value.tables;
  if (!tables || typeof tables !== 'object' || Object.keys(tables).length !== tableNames.length) throw new Error('テーブルが不正です');
  for (const name of tableNames) {
    const rows = (tables as Record<string, unknown>)[name];
    if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
      throw new Error('バックアップの行形式が不正です');
    }
  }
  if (!('checksum' in value) || value.checksum !== checksum(tables)) throw new Error('バックアップのチェックサムが一致しません');
  return value as Backup;
}
