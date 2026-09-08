import type { PoolConfig } from 'pg';

/** Lambdaごとの接続を制限し、RDSの証明書を検証する。 */
export function databaseConfig(env: NodeJS.ProcessEnv, ca?: string): PoolConfig {
  const limits = { max: 2, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000 };
  if (env.DB_HOST) {
    if (!env.DB_USER || !env.DB_PASSWORD || !ca) throw new Error('DB接続設定が不足しています');
    return {
      ...limits, host: env.DB_HOST, port: 5432, database: 'gatherquiz',
      user: env.DB_USER, password: env.DB_PASSWORD, ssl: { ca, rejectUnauthorized: true },
    };
  }
  if (!env.DATABASE_URL) throw new Error('DB接続設定が不足しています');
  return { ...limits, connectionString: env.DATABASE_URL };
}
