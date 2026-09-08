import { describe, expect, it } from 'vitest';
import { databaseConfig } from '../src/database-config';

describe('DB接続設定', () => {
  it('本番ではCA検証を有効にし、接続数を制限する', () => {
    const config = databaseConfig({ DB_HOST: 'db.example', DB_USER: 'app', DB_PASSWORD: 'secret' }, 'test-ca');
    expect(config).toMatchObject({ host: 'db.example', max: 2, ssl: { ca: 'test-ca', rejectUnauthorized: true } });
  });

  it('接続情報が不足している場合は値を含めず失敗する', () => {
    expect(() => databaseConfig({ DB_HOST: 'db.example', DB_PASSWORD: 'secret' }, 'ca')).toThrow('DB接続設定が不足しています');
  });

  it('ローカルPostgreSQLの接続URLも利用できる', () => {
    expect(databaseConfig({ DATABASE_URL: 'postgresql://localhost/test' })).toMatchObject({
      connectionString: 'postgresql://localhost/test', max: 2,
    });
  });
});
