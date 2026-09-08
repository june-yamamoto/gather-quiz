import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { databaseConfig } from './database-config';

/** プロセス内で再利用し、Lambdaの接続数増加を抑える。 */
export let prisma: PrismaClient;

/** 本番ではネットワーク経由の秘密取得をせず、デプロイ時に注入した設定を使う。 */
export async function initPrisma() {
  if (prisma) return;
  const ca = process.env.DB_HOST ? readFileSync(join(__dirname, 'rds-ca-bundle.pem'), 'utf8') : undefined;
  const pool = new Pool(databaseConfig(process.env, ca));
  prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
}

if (process.env.NODE_ENV === 'test' || process.env.DATABASE_URL?.startsWith('file:')) {
  // 本番バンドルでは除外し、SQLiteのネイティブ依存を配布しない。
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3') as typeof import('@prisma/adapter-better-sqlite3');
  prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./test.db' }) });
} else if (process.env.DATABASE_URL || process.env.DB_HOST) {
  void initPrisma();
}
