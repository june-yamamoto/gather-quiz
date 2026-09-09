import { hashPassword } from './password';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Pool, PoolClient } from 'pg';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { databaseConfig } from './database-config';
import { checksum, decodeBackup, encodeBackup, tableNames, Tables } from './backup-format';

interface Operation { action: 'migrate' | 'backup' | 'restore' | 'verify' | 'cleanup-smoke'; key?: string; confirm?: string; tournamentId?: string }
const schemaSql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
const schemaHash = checksum(schemaSql);
const initialSchemaHash = checksum(readFileSync(join(__dirname, 'schema.initial.sql'), 'utf8'));
const questionSlotsMigration = readFileSync(join(__dirname, 'migration.question-slots.sql'), 'utf8');
const questionSlotsSchemaHash = checksum(readFileSync(join(__dirname, 'schema.question-slots.sql'), 'utf8'));
const credentialsMigration = readFileSync(join(__dirname, 'migration.participant-credentials.sql'), 'utf8');
const credentialsSchemaHash = checksum(readFileSync(join(__dirname, 'schema.participant-credentials.sql'), 'utf8'));
const correctChoiceMigration = readFileSync(join(__dirname, 'migration.correct-choice.sql'), 'utf8');
const correctChoiceSchemaHash = checksum(readFileSync(join(__dirname, 'schema.correct-choice.sql'), 'utf8'));
const teamScoringMigration = readFileSync(join(__dirname, 'migration.team-scoring.sql'), 'utf8');
const s3 = new S3Client({});

/** 識別子はエスケープし、値は常にプレースホルダーを使う。 */
function identifier(name: string): string { return `"${name.replaceAll('"', '""')}"`; }

/** 同一トランザクションのスナップショットから全テーブルを取り出す。 */
async function readTables(db: PoolClient, schema = 'public'): Promise<Tables> {
  const result = {} as Tables;
  for (const name of tableNames) {
    result[name] = (await db.query(`SELECT * FROM ${identifier(schema)}.${identifier(name)} ORDER BY "id"`)).rows;
  }
  return result;
}

/** バックアップの内容やパスワードをログ・レスポンスに含めずS3へ保存する。 */
async function saveBackup(tables: Tables) {
  const key = `backups/${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}.json.gz`;
  const body = encodeBackup(tables, schemaHash);
  if (body.length > 32 * 1024 * 1024) throw new Error('バックアップ上限を超えています');
  await s3.send(new PutObjectCommand({ Bucket: process.env.BACKUP_BUCKET, Key: key, Body: body, ContentType: 'application/gzip' }));
  return { key, bytes: body.length, counts: Object.fromEntries(tableNames.map(name => [name, tables[name].length])) };
}

/** 復元前に列名もDBと照合し、未知の列や不完全な行を拒否する。 */
async function insertTables(db: PoolClient, tables: Tables, schema: string) {
  for (const name of tableNames) {
    const metadata = await db.query('SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position', [schema, name]);
    const columns: string[] = metadata.rows.map(row => row.column_name);
    for (const row of tables[name]) {
      if (Object.keys(row).length !== columns.length || columns.some(column => !(column in row))) throw new Error('バックアップの列が一致しません');
      await db.query(`INSERT INTO ${identifier(schema)}.${identifier(name)} (${columns.map(identifier).join(',')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(',')})`, columns.map(column => row[column]));
    }
  }
}

/** APIから分離したIAM認証専用の運用入口。リストアは全件を一括してコミットする。 */
export async function handler(event: Operation) {
  if (!event || !['migrate', 'backup', 'restore', 'verify', 'cleanup-smoke'].includes(event.action)) throw new Error('操作が不正です');
  const pool = new Pool(databaseConfig(process.env, readFileSync(join(__dirname, 'rds-ca-bundle.pem'), 'utf8')));
  const db = await pool.connect();
  try {
    await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
    await db.query("SET LOCAL lock_timeout = '10s'");
    await db.query("SET LOCAL statement_timeout = '120s'");
    await db.query('SELECT pg_advisory_xact_lock(7342901)');
    if (event.action === 'cleanup-smoke') {
      const target = await db.query('SELECT name FROM "Tournament" WHERE id=$1 FOR UPDATE', [event.tournamentId]);
      if (!target.rows[0]?.name.startsWith('codex-smoke-')) throw new Error('スモークテスト用大会のみ削除できます');
      await db.query('DELETE FROM "Quiz" WHERE "tournamentId"=$1', [event.tournamentId]);
      await db.query('DELETE FROM "Participant" WHERE "tournamentId"=$1', [event.tournamentId]);
      await db.query('DELETE FROM "Tournament" WHERE id=$1', [event.tournamentId]);
      await db.query('COMMIT');
      return { cleaned: true };
    }
    if (event.action === 'migrate') {
      await db.query('CREATE TABLE IF NOT EXISTS "_GatherQuizSchema" (hash TEXT PRIMARY KEY)');
      const applied = await db.query('SELECT hash FROM "_GatherQuizSchema"');
      if (applied.rowCount === 0) {
        await db.query(schemaSql);
        await db.query('INSERT INTO "_GatherQuizSchema" (hash) VALUES ($1)', [schemaHash]);
      } else if (applied.rowCount === 1 && [initialSchemaHash, questionSlotsSchemaHash, credentialsSchemaHash, correctChoiceSchemaHash].includes(applied.rows[0].hash)) {
        if (applied.rows[0].hash === initialSchemaHash) await db.query(questionSlotsMigration);
        if ([initialSchemaHash, questionSlotsSchemaHash].includes(applied.rows[0].hash)) {
          await db.query(credentialsMigration);
          const participants = await db.query('SELECT id, password FROM "Participant"');
          for (const participant of participants.rows) {
            await db.query('UPDATE "Participant" SET password=$1 WHERE id=$2', [await hashPassword(participant.password), participant.id]);
          }
        }
        if (applied.rows[0].hash !== correctChoiceSchemaHash) await db.query(correctChoiceMigration);
        await db.query(teamScoringMigration);
        await db.query('UPDATE "_GatherQuizSchema" SET hash=$1', [schemaHash]);
      } else if (applied.rowCount !== 1 || applied.rows[0].hash !== schemaHash) {
        throw new Error('既存DBに対する明示的なマイグレーションが必要です');
      }
      const role = await db.query("SELECT 1 FROM pg_roles WHERE rolname='gatherquiz_app'");
      const statement = role.rowCount ? 'ALTER ROLE %I LOGIN PASSWORD %L' : 'CREATE ROLE %I LOGIN PASSWORD %L';
      const sql = await db.query('SELECT format($1, $2::text, $3::text) AS sql', [statement, 'gatherquiz_app', process.env.DB_APP_PASSWORD]);
      await db.query(sql.rows[0].sql);
      await db.query('GRANT USAGE ON SCHEMA public TO gatherquiz_app');
      await db.query('GRANT SELECT, INSERT, UPDATE, DELETE ON "Tournament", "Participant", "Quiz" TO gatherquiz_app');
      await db.query('COMMIT');
      return { migrated: true, schemaHash };
    }
    if (event.action === 'backup') {
      const saved = await saveBackup(await readTables(db));
      await db.query('COMMIT');
      return saved;
    }
    if (!event.key?.startsWith('backups/') || event.key.includes('..')) throw new Error('バックアップキーが不正です');
    if (event.action === 'restore' && event.confirm !== process.env.STACK_NAME) throw new Error('復元先スタック名の確認が必要です');
    const response = await s3.send(new GetObjectCommand({ Bucket: process.env.BACKUP_BUCKET, Key: event.key }));
    if (!response.Body || (response.ContentLength ?? Infinity) > 32 * 1024 * 1024) throw new Error('バックアップサイズが不正です');
    const backup = decodeBackup(Buffer.from(await response.Body.transformToByteArray()), schemaHash);
    let before: Awaited<ReturnType<typeof saveBackup>> | undefined;
    const target = event.action === 'verify' ? `verify_${randomUUID().replaceAll('-', '')}` : 'public';
    if (event.action === 'verify') {
      await db.query(`CREATE SCHEMA ${identifier(target)}`);
      await db.query(`SET LOCAL search_path TO ${identifier(target)}`);
      await db.query(schemaSql);
    } else {
      await db.query('LOCK TABLE "Tournament", "Participant", "Quiz" IN ACCESS EXCLUSIVE MODE');
      before = await saveBackup(await readTables(db));
      await db.query('DELETE FROM "Quiz"');
      await db.query('DELETE FROM "Participant"');
      await db.query('DELETE FROM "Tournament"');
    }
    await insertTables(db, backup.tables, target);
    const actual = await readTables(db, target);
    if (checksum(actual) !== backup.checksum) throw new Error('復元後のデータ検証に失敗しました');
    if (event.action === 'verify') await db.query(`DROP SCHEMA ${identifier(target)} CASCADE`);
    await db.query('COMMIT');
    return { verified: true, restored: event.action === 'restore', before, counts: Object.fromEntries(tableNames.map(name => [name, actual[name].length])) };
  } catch (error) {
    await db.query('ROLLBACK');
    // PostgreSQLの詳細エラーには行データが含まれるため出力しない。
    if (error instanceof Error && !('code' in error)) throw error;
    throw new Error('DB操作に失敗しました。データ変更はロールバックしました');
  } finally {
    db.release();
    await pool.end();
  }
}
