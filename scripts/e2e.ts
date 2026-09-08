import { execFileSync } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
/** Windowsで子サーバーが強制終了されても、一時DBと生成Clientを復元する。 */
try {
  execFileSync(process.execPath, [join(root, 'node_modules/@playwright/test/cli.js'), 'test', ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
} catch { process.exitCode = 1; }
finally {
  const directory = join(root, 'backend/build');
  for (const name of readdirSync(directory)) {
    if (/^test-\d+\.db(?:-shm|-wal|-journal)?$/.test(name)) rmSync(join(directory, name), { force: true });
  }
  execFileSync(process.execPath, [join(root, 'backend/node_modules/prisma/build/index.js'), 'generate', '--schema', 'prisma/schema.prisma'], { cwd: join(root, 'backend'), stdio: 'ignore' });
}
