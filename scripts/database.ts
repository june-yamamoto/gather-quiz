import { databaseOperation } from './aws.ts';
import { stack } from './config.ts';

/** 復元時は対象名を明示し、操作の取り違えを防止する。 */
async function main() {
  const [action, key, confirmation] = process.argv.slice(2);
  if (!['backup', 'restore', 'verify'].includes(action)) throw new Error('Expected backup, restore or verify');
  if (action !== 'backup' && !key) throw new Error('バックアップのS3キーを指定してください');
  if (action === 'restore' && confirmation !== `--confirm=${stack}`) throw new Error(`復元先を --confirm=${stack} で指定してください`);
  console.log(JSON.stringify(await databaseOperation({ action, key, confirm: action === 'restore' ? stack : undefined }), null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
