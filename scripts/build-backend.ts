import { createRequire } from 'node:module';
import { mkdir, readdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ZipFile } from 'yazl';

const root = resolve(import.meta.dirname, '..');
const backend = join(root, 'backend');
const requireBackend = createRequire(join(backend, 'package.json'));
const { build } = requireBackend('esbuild') as typeof import('../backend/node_modules/esbuild/lib/main.js');

/** 同じ内容から同じZIPを生成し、変更のないコード更新を省略できるようにする。 */
export async function buildBackend() {
  const started = performance.now();
  const output = join(backend, 'build', 'zip');
  await mkdir(output, { recursive: true });
  execFileSync(process.execPath, [requireBackend.resolve('prisma/build/index.js'), 'generate', '--schema', 'prisma/schema.postgres.prisma'], { cwd: backend, stdio: 'inherit' });
  await build({
    absWorkingDir: backend, entryPoints: ['src/lambda.ts', 'src/maintenance.ts'], outdir: output,
    bundle: true, platform: 'node', target: 'node24', format: 'cjs', minify: true,
    external: ['@prisma/adapter-better-sqlite3', 'pg-native'],
  });
  const schema = await readFile(join(backend, 'prisma/schema.current.sql'), 'utf8');
  const generated = execFileSync(process.execPath, [requireBackend.resolve('prisma/build/index.js'), 'migrate', 'diff', '--from-empty', '--to-schema', 'prisma/schema.postgres.prisma', '--script'], {
    cwd: backend, encoding: 'utf8', env: { ...process.env, DATABASE_URL: 'postgresql://unused:unused@localhost:5432/gatherquiz' },
  });
  /** CLI版による修飾名・コメント差を除き、未反映のスキーマ変更を検出する。 */
  const canonical = (sql: string) => sql.replace(/--[^\n]*/g, '').replace(/CREATE SCHEMA IF NOT EXISTS "public";/g, '').replaceAll('"public".', '').replace(/\s+/g, '');
  if (canonical(schema) !== canonical(generated)) throw new Error('Prismaスキーマと初期SQLが一致しません。マイグレーションを更新してください');
  await writeFile(join(output, 'schema.sql'), schema.replaceAll('\r\n', '\n'));
  await writeFile(join(output, 'schema.initial.sql'), (await readFile(join(backend, 'prisma/migrations/0001_initial/migration.sql'), 'utf8')).replaceAll('\r\n', '\n'));
  await writeFile(join(output, 'migration.question-slots.sql'), (await readFile(join(backend, 'prisma/migrations/0002_question_slots/migration.sql'), 'utf8')).replaceAll('\r\n', '\n'));
  await writeFile(join(output, 'schema.question-slots.sql'), (await readFile(join(backend, 'prisma/migrations/0002_question_slots/schema.sql'), 'utf8')).replaceAll('\r\n', '\n'));
  await writeFile(join(output, 'migration.participant-credentials.sql'), (await readFile(join(backend, 'prisma/migrations/0003_participant_credentials/migration.sql'), 'utf8')).replaceAll('\r\n', '\n'));
  await writeFile(join(output, 'schema.participant-credentials.sql'), (await readFile(join(backend, 'prisma/migrations/0003_participant_credentials/schema.sql'), 'utf8')).replaceAll('\r\n', '\n'));
  await writeFile(join(output, 'migration.correct-choice.sql'), (await readFile(join(backend, 'prisma/migrations/0004_correct_choice/migration.sql'), 'utf8')).replaceAll('\r\n', '\n'));
  const caPath = join(backend, 'build', 'rds-ca-bundle.pem');
  try { await stat(caPath); } catch {
    const response = await fetch('https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem');
    if (!response.ok) throw new Error('RDS CA download failed');
    await writeFile(caPath, await response.text());
  }
  await copyFile(caPath, join(output, 'rds-ca-bundle.pem'));
  const zip = new ZipFile();
  const fixedTime = new Date('2025-01-01T00:00:00Z');
  /** アセットの順序とタイムスタンプを固定する。 */
  async function addDirectory(path: string, prefix: string) {
    for (const entry of (await readdir(path, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const key = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await addDirectory(join(path, entry.name), key);
      else if (entry.isFile()) zip.addBuffer(await readFile(join(path, entry.name)), key, { mtime: fixedTime, mode: 0o100644 });
    }
  }
  await addDirectory(output, '');
  const file = join(backend, 'build', 'function.zip');
  await new Promise<void>((accept, reject) => {
    zip.outputStream.pipe(createWriteStream(file)).on('close', accept).on('error', reject);
    zip.outputStream.on('error', reject);
    zip.end();
  });
  const bytes = await readFile(file);
  const result = { file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), seconds: Number(((performance.now() - started) / 1000).toFixed(2)) };
  await writeFile(join(backend, 'build', 'manifest.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ phase: 'backend-build', ...result }));
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  buildBackend().catch(error => { console.error(error.message); process.exitCode = 1; });
}
