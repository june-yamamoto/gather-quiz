import { PrismaClient } from '@prisma/client';
import { Pool, PoolConfig } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import * as fs from 'fs';

export let prisma: PrismaClient;

const RDS_CA_BUNDLE_PATH = '/etc/pki/tls/certs/rds-ca-bundle.pem';

/**
 * PrismaClientを初期化する関数。
 * Lambda環境ではSecrets Managerから接続情報を取得し、PostgreSQLアダプターで初期化する。
 * すでに初期化済みの場合は何もしない。
 * ローカル開発環境やテスト環境ではDATABASE_URLが設定されていればそれを使用する。
 */
export async function initPrisma() {
  if (prisma) {
    console.log('PrismaClient already initialized.');
    return;
  }

  let databaseUrl: string | undefined;

  // Lambda環境でSECRET_IDが設定されている場合、Secrets ManagerからDB接続情報を取得
  if (process.env.SECRET_ID && !process.env.DATABASE_URL) {
    console.log('Retrieving DB credentials from Secrets Manager...');
    try {
      const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });
      const response = await client.send(
        new GetSecretValueCommand({ SecretId: process.env.SECRET_ID })
      );

      if (!response.SecretString) {
        throw new Error('SecretString not found in Secrets Manager response.');
      }
      
      const secret = JSON.parse(response.SecretString);
      const user = encodeURIComponent(secret.username);
      const password = encodeURIComponent(secret.password);
      const host = secret.host;
      const port = secret.port;
      const dbname = secret.dbname;
      const sslmode = secret.sslmode || 'require'; // Secrets Managerで指定されていなければrequireをデフォルトとする
      
      databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${dbname}?schema=public&sslmode=${sslmode}`;
      
      // 環境変数にもセットしておくことで、後続の処理やPrisma Clientの初期化で利用可能にする
      process.env.DATABASE_URL = databaseUrl;
      console.log('DB credentials successfully retrieved and DATABASE_URL set from Secrets Manager.');

    } catch (error) {
      console.error('Failed to retrieve secret from Secrets Manager:', error);
      throw new Error(`Failed to initialize Prisma: Secrets Manager error - ${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (process.env.DATABASE_URL) {
    // ローカル開発環境やテスト環境などでDATABASE_URLが直接設定されている場合
    databaseUrl = process.env.DATABASE_URL;
    console.log('Using DATABASE_URL from environment variables.');
  }

  if (!databaseUrl) {
    // どちらの方法でもDATABASE_URLが設定されなかった場合
    throw new Error('DATABASE_URL environment variable is not set and could not be retrieved.');
  }

  console.log(`Initializing PrismaClient for provider: ${databaseUrl.startsWith('postgresql') ? 'PostgreSQL' : 'SQLite'}...`);

  // 接続文字列がPostgreSQLの場合のみPrismaPgアダプタを使用
  if (databaseUrl.startsWith('postgresql')) {
    const poolConfig: PoolConfig = {
      connectionString: databaseUrl,
    };

    if (typeof poolConfig.ssl === 'object' && poolConfig.ssl && !poolConfig.ssl.ca) {
      console.warn(`RDS CA Bundle not found at ${RDS_CA_BUNDLE_PATH}. SSL connection might fail.`);
    }
    
    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else if (databaseUrl.startsWith('file:')) {
    // SQLiteの場合（テスト環境などで）
    prisma = new PrismaClient();
  } else {
    throw new Error(`Unsupported database URL protocol: ${databaseUrl}`);
  }
  
  console.log('PrismaClient initialized.');
}

// ローカル開発やテストでの互換性のため、トップレベルで即時初期化を試みる
// ただし、非同期のためここでは initPrisma() を直接呼び出さない
// その代わりに、lambda.ts やローカルの起動スクリプト (index.ts) で await initPrisma() を呼ぶ

// テスト環境では、initPrismaが呼ばれる前にPrismaClientのインスタンスが必要な場合があるため、
// DATABASE_URLが設定されている場合は即座に初期化を試みる (主にSQLite用)
if (process.env.NODE_ENV === 'test' && process.env.DATABASE_URL?.startsWith('file:')) {
  console.log('Initializing PrismaClient for test environment (SQLite).');
  prisma = new PrismaClient();
} else {
  // Lambda環境や通常のローカル開発ではinitPrismaを明示的に呼び出す必要がある
  // prisma変数はundefinedのままexportされる。
  console.log('PrismaClient initialization deferred. Call initPrisma() explicitly.');
}