import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

let prisma: PrismaClient;

// NODE_ENVに応じてPrismaClientのインスタンス化を切り替える
if (process.env.NODE_ENV === 'test') {
  // テスト環境では、アダプタを使わず、環境変数で設定されたDB（SQLite）を直接使用する
  // pretestスクリプトでschema.prismaが書き換えられ、DATABASE_URLが設定される前提
  prisma = new PrismaClient();
} else {
  // 本番環境（Lambda）では、Driver Adapterを使用してコネクションプーリングを行う
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in production');
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

export { prisma };
