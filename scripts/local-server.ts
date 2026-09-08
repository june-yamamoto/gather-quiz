import { execFileSync, spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const backend = resolve(import.meta.dirname, '../backend');
const database = join(backend, 'dev.db');
const env = { ...process.env, NODE_ENV: 'development', DATABASE_URL: `file:${database.replaceAll('\\', '/')}` };
if (!existsSync(database)) writeFileSync(database, '');
for (const command of [['generate', '--schema', 'prisma/schema.prisma'], ['db', 'push', '--schema', 'prisma/schema.prisma']]) {
  execFileSync(process.execPath, [join(backend, 'node_modules/prisma/build/index.js'), ...command], { cwd: backend, env, stdio: 'inherit' });
}
const child = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], { cwd: backend, env, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => child.kill(signal));
child.on('exit', code => { process.exitCode = code || 0; });
