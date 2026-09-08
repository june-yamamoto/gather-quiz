import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const backend = resolve(import.meta.dirname, '../backend');
const prisma = join(backend, 'node_modules/prisma/build/index.js');
const database = join(backend, 'build', `test-${process.pid}.db`);
const env = { ...process.env, NODE_ENV: 'test', DATABASE_URL: `file:${database.replaceAll('\\', '/')}` };
const server = process.argv.includes('--server');
const schema = server ? 'prisma/schema.e2e.prisma' : 'prisma/schema.test.prisma';
mkdirSync(join(backend, 'build'), { recursive: true });
// Windows上のPrismaは存在しないSQLiteファイルの初回作成に失敗するため先に作る。
writeFileSync(database, '');

/** スキーマ自体は書き換えず、生成したClientと一時DBだけを片付ける。 */
function cleanup() {
  for (const suffix of ['', '-shm', '-wal', '-journal']) rmSync(`${database}${suffix}`, { force: true });
  execFileSync(process.execPath, [prisma, 'generate', '--schema', 'prisma/schema.prisma'], { cwd: backend, stdio: 'ignore' });
}

try {
  for (const command of [['generate', '--schema', schema], ['db', 'push', '--schema', schema]]) {
    execFileSync(process.execPath, [prisma, ...command], { cwd: backend, env, stdio: 'inherit' });
  }
  if (server) {
    const child = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], { cwd: backend, env, stdio: 'inherit' });
    for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => child.kill(signal));
    child.on('exit', code => { cleanup(); process.exit(code || 0); });
  } else {
    try {
      execFileSync(process.execPath, [join(backend, 'node_modules/vitest/vitest.mjs'), 'run'], { cwd: backend, env, stdio: 'inherit' });
    } finally { cleanup(); }
  }
} catch { process.exitCode = 1; }
