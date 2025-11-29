import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// PrismaClientインスタンスを保持する変数
// 初期化は initPrisma() またはトップレベル（ローカル/テスト環境の場合）で行われる
export let prisma: PrismaClient;

/**
 * PrismaClientを初期化する関数。
 * Lambda環境ではSecrets Managerから接続情報を取得して初期化する。
 * すでに初期化済みの場合は何もしない。
 */
export async function initPrisma() {
  if (prisma) return;

  let databaseUrl = process.env.DATABASE_URL;

  // DATABASE_URLがなく、SECRET_IDがある場合はSecrets Managerから取得
  if (!databaseUrl && process.env.SECRET_ID) {
    try {
      const client = new SecretsManagerClient();
      const response = await client.send(
        new GetSecretValueCommand({ SecretId: process.env.SECRET_ID })
      );
      
      if (response.SecretString) {
        const secret = JSON.parse(response.SecretString);
        // { username, password, host, port, dbname, sslmode }
        // パスワードなどの特殊文字をエンコードする必要がある場合に備えてencodeURIComponentを使用することを検討すべきだが、
        // JSONプロパティとして正しく取得できていればテンプレートリテラル埋め込みで通常は問題ない。
        // 安全のため、ユーザー名とパスワードはエンコードする。
        const user = encodeURIComponent(secret.username);
        const password = encodeURIComponent(secret.password);
        const host = secret.host;
        const port = secret.port;
        const dbname = secret.dbname;
        const sslmode = secret.sslmode || 'prefer';
        
        databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${dbname}?schema=public&sslmode=${sslmode}`;
        
        // 後続の処理のために環境変数にもセットしておく（オプション）
        process.env.DATABASE_URL = databaseUrl;
      }
    } catch (error) {
      console.error('Failed to retrieve secret from Secrets Manager:', error);
      throw error;
    }
  }

  if (!databaseUrl) {
    // テスト環境などで明示的に初期化されていない場合のエラーハンドリング
    // ただし、トップレベルの初期化ロジックでカバーされるはず
    throw new Error('DATABASE_URL environment variable is not set and could not be retrieved from Secrets Manager.');
  }

  console.log('Initializing PrismaClient with connection pool...');
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

// ローカル開発環境やテスト環境、ビルド時など、DATABASE_URLが既に存在する場合の即時初期化ロジック
// これにより、既存のスクリプト（dev, testなど）が変更なしで動作する
if (process.env.NODE_ENV === 'test') {
  // テスト環境
  prisma = new PrismaClient();
} else if (process.env.DATABASE_URL) {
  // ローカル開発環境（DATABASE_URLが設定されている場合）
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // Lambda環境など、DATABASE_URLがなく、非同期初期化が必要な場合
  // prisma変数はundefinedのまま。利用側（lambda.ts）で必ず initPrisma() を呼ぶこと。
  console.log('PrismaClient initialization deferred. Waiting for initPrisma() call.');
}