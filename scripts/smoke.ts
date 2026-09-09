import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { outputs, databaseOperation } from './aws.ts';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { region } from './config.ts';
import { frontendAuthorization } from './frontend-auth.ts';

/** 実データを出力せず、配信・DB・画像・バックアップ復元を通して検証する。 */
async function main() {
  const state = await outputs();
  const started = performance.now();
  const checks: string[] = [];
  /** 認証情報を含むレスポンス本文はエラーにも出さない。 */
  async function api(path: string, method = 'GET', body?: unknown) {
    const response = await fetch(`${state.Url}/api${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(45000) });
    assert.ok(response.ok, `${method} ${path}: HTTP ${response.status}`);
    return response.json();
  }
  const authorization = await frontendAuthorization();
  const headers: Record<string, string> = authorization ? { Authorization: authorization } : {};
  if (authorization) {
    for (const path of ['/gather/tournaments/new', '/index.html', '/assets/nonexistent.js']) {
      const denied = await fetch(`${state.Url}${path}`);
      assert.equal(denied.status, 401);
      assert.match(denied.headers.get('www-authenticate') || '', /^Basic /);
    }
    checks.push('frontend Basic authentication');
  }
  const html = await fetch(`${state.Url}/gather/tournaments/new`, { headers });
  assert.equal(html.status, 200);
  assert.match(html.headers.get('content-type') || '', /text\/html/);
  const text = await html.text();
  const asset = text.match(/src="([^" ]+\.js)"/)?.[1];
  assert.ok(asset, 'JSアセット参照');
  const js = await fetch(new URL(asset, state.Url), { headers });
  assert.equal(js.status, 200);
  assert.match(js.headers.get('cache-control') || '', /immutable/);
  const missing = await fetch(`${state.Url}/api/tournaments/${randomUUID()}`);
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get('content-type') || '', /application\/json/);
  checks.push('SPA deep link', 'hashed asset cache', 'API 404 + DB connection');
  if (!process.argv.includes('--read-only')) {
    let tournamentId: string | undefined;
    let imageKey: string | undefined;
    try {
      const password = randomUUID();
      const tournament = await api('/tournaments', 'POST', { name: `codex-smoke-${randomUUID()}`, password, questionsPerParticipant: 1, points: '10' });
      tournamentId = tournament.id;
      assert.ok(tournamentId);
      await api(`/tournaments/${tournamentId}/login`, 'POST', { password });
      const participant = await api(`/tournaments/${tournamentId}/participants`, 'POST', { name: '動作確認' });
      await api(`/tournaments/${tournamentId}/participants/login`, 'POST', { name: participant.name, password: participant.password });
      const image = await api('/upload/image', 'POST', { tournamentId, participantId: participant.id, fileName: 'smoke.png', fileType: 'image/png' });
      const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jT1kAAAAASUVORK5CYII=', 'base64');
      const put = await fetch(image.signedUrl, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: png });
      assert.ok(put.ok, `画像アップロード: ${put.status}`);
      imageKey = new URL(image.objectUrl).pathname.slice(1);
      const retrieved = await fetch(image.objectUrl);
      assert.equal(retrieved.status, 200);
      assert.deepEqual(Buffer.from(await retrieved.arrayBuffer()), png);
      const quiz = await api('/quizzes', 'POST', { tournamentId, participantId: participant.id, point: 10, questionText: '日本の首都は？', answerText: '東京', questionImage: image.objectUrl });
      assert.equal((await api(`/quizzes/${quiz.id}`)).answerText, '東京');
      await api(`/tournaments/${tournamentId}/start`, 'PATCH');
      assert.ok((await api(`/tournaments/${tournamentId}/board`)).participants.length > 0);
      const backup = await databaseOperation({ action: 'backup' }, state);
      const verified = await databaseOperation({ action: 'verify', key: backup.key }, state);
      assert.equal(verified.verified, true);
      checks.push('tournament + organizer login', 'participant + login', 'S3 PUT + CloudFront image GET', 'quiz + board', 'backup + isolated schema restore + checksum');
    } finally {
      if (imageKey) await new S3Client({ region }).send(new DeleteObjectCommand({ Bucket: state.UploadBucket, Key: imageKey }));
      if (tournamentId) await databaseOperation({ action: 'cleanup-smoke', tournamentId }, state);
    }
  }
  const result = { at: new Date().toISOString(), url: state.Url, checks, seconds: Number(((performance.now() - started) / 1000).toFixed(2)) };
  await mkdir('artifacts', { recursive: true });
  await writeFile(`artifacts/smoke-${Date.now()}.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
