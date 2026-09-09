import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

/** 別プロセスで設定を読み、呼び出し元の環境変数に影響させない。 */
function config(environment: string) {
  return JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', "import { stack, domain } from './scripts/config.ts'; console.log(JSON.stringify({ stack, domain }));"], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GATHER_ENV: environment, GATHER_STACK: '', GATHER_DOMAIN: '' },
  }));
}

test('本番環境はdevと別のスタックとドメインを選ぶ', () => {
  assert.deepEqual(config('prod'), { stack: 'gather-quiz-prod', domain: 'gather-quiz.june-yamamoto.com' });
  assert.deepEqual(config('dev'), { stack: 'gather-quiz-dev', domain: 'dev.gather-quiz.june-yamamoto.com' });
});

test('環境名の誤記でdevへデプロイしない', () => {
  assert.throws(() => config('production'));
});
