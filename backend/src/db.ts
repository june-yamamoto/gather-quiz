import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// PrismaClientインスタンスを保持する変数
// 初期化は initPrisma() またはトップレベル（ローカル/テスト環境の場合）で行われる
export let prisma: PrismaClient;

/**
 * PrismaClientを初期化する関数。
 * Lambda環境ではSecrets Managerから接続情報を取得して初期化する。
 * すでに初期化済みの場合は何もしない。
 */
export async function initPrisma() {
  if (prisma) {
    console.log('PrismaClient already initialized. Skipping.');
    return;
  }

  let databaseUrl = process.env.DATABASE_URL;

  // DATABASE_URLがなく、SECRET_IDがある場合はSecrets Managerから取得
  if (!databaseUrl && process.env.SECRET_ID) {
    console.log(`Attempting to retrieve secret from Secrets Manager with ID: ${process.env.SECRET_ID}`);
    try {
      const client = new SecretsManagerClient();
      const response = await client.send(new GetSecretValueCommand({ SecretId: process.env.SECRET_ID }));

      if (response.SecretString) {
        const secret = JSON.parse(response.SecretString);
        // デバッグログ: パスワードは出力しない
        console.log('Secret retrieved (partial):', {
          host: secret.host,
          port: secret.port,
          dbname: secret.dbname,
          user: secret.username,
          sslmode: secret.sslmode,
        });

        const user = encodeURIComponent(secret.username);
        const password = encodeURIComponent(secret.password); // パスワードはエンコード
        const host = secret.host;
        const port = secret.port;
        const dbname = secret.dbname;
        // sslmodeはPoolの設定(rejectUnauthorized: false)に任せるため、URLには含めない

        databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${dbname}?schema=public`;
        // デバッグログ: パスワード以降はマスク
        console.log(
          'Constructed DATABASE_URL (partial):',
          databaseUrl.substring(0, databaseUrl.indexOf('@') + 1) + '...'
        );

        process.env.DATABASE_URL = databaseUrl; // 環境変数にもセット
      } else {
        console.error('SecretString is empty.');
      }
    } catch (error) {
      console.error('Failed to retrieve secret from Secrets Manager or parse:', error);
      throw error;
    }
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set and could not be retrieved from Secrets Manager.');
  }

  console.log('Initializing PrismaClient with connection pool...');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  console.log('PrismaClient initialized.');
}

// ローカル開発環境やテスト環境、ビルド時など、DATABASE_URLが既に存在する場合の即時初期化ロジック
// これにより、既存のスクリプト（dev, testなど）が変更なしで動作する
if (process.env.NODE_ENV === 'test') {
  // テスト環境: SQLite (BetterSqlite3 Adapter)
  console.log('PrismaClient initializing for test environment (SQLite/BetterSqlite3).');
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./test.db',
  });
  prisma = new PrismaClient({ adapter });
  console.log('PrismaClient initialized for test environment.');
} else if (process.env.DATABASE_URL) {
  // ローカル開発環境（DATABASE_URLが設定されている場合）
  console.log('PrismaClient initializing for local development (PostgreSQL).');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  console.log('PrismaClient initialized for local development.');
} else {
  // Lambda環境など、DATABASE_URLがなく、非同期初期化が必要な場合
  // prisma変数はundefinedのまま。利用側（lambda.ts）で必ず initPrisma() を呼ぶこと。
  console.log('PrismaClient initialization deferred. Waiting for initPrisma() call.');
}
