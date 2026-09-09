import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { makeAudio } from './helpers/media';

/** Canvasを録画し、ブラウザ自身で再生可能なWebMを生成する。 */
const makeVideo = async (page: Page) => Buffer.from(await page.evaluate(async () => {
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;
  const ctx = canvas.getContext('2d')!;
  const stream = canvas.captureStream(15);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);
  const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
  recorder.start();
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = '#205649'; ctx.fillRect(0, 0, 640, 360);
    ctx.fillStyle = '#e4efe9'; ctx.beginPath(); ctx.arc(100 + i * 12, 180, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white'; ctx.font = '24px sans-serif'; ctx.fillText('GatherQuiz / Video playback test', 110, 320);
    await new Promise((resolve) => setTimeout(resolve, 67));
  }
  recorder.stop(); await stopped; stream.getTracks().forEach((track) => track.stop());
  return Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()));
}));

/** テストから実画面の証拠を再生成できるようにする。 */
const evidence = async (page: Page, name: string) => {
  if (!process.env.CAPTURE_MEDIA_EVIDENCE) return;
  const directory = resolve('docs/evidence/quiz-media');
  mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: resolve(directory, `${name}.png`), fullPage: true });
};

for (const width of [390, 1280]) {
test(`${width}pxで長文・4択・画像と動画・音声を併用し、保存・プレビュー・本番再生・編集できる`, async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 1100 });
  const tournament = await (await request.post('http://localhost:3000/api/tournaments', { data: { name: 'メディア動作検証', password: 'test-only', questionsPerParticipant: 1, points: '10', questionSlots: [{ label: '図形', choiceCount: 4 }] } })).json();
  const participant = await (await request.post(`http://localhost:3000/api/tournaments/${tournament.id}/participants`, { data: { name: 'メディア検証', loginId: 'user1', password: '123456' } })).json();
  const dashboard = `/gather/tournaments/${tournament.id}/participants/${participant.id}`;
  await page.goto(`${dashboard}/quizzes/new?order=0&point=10`);
  const video = await makeVideo(page);
  const audio = makeAudio();
  const files = new Map<string, Buffer>();
  // AWSへの書き込みだけを代替し、保存API・DB・実ファイルの再生は実物を使う。
  await page.route('**/api/upload/media', async (route) => {
    const { fileType } = route.request().postDataJSON();
    const url = `http://localhost:5173/uploads/test.${fileType.startsWith('video') ? 'webm' : 'wav'}`;
    await route.fulfill({ json: { signedUrl: url, objectUrl: url } });
  });
  await page.route('**/uploads/test.*', async (route) => {
    const url = route.request().url();
    if (route.request().method() === 'PUT') {
      files.set(url, route.request().postDataBuffer()!);
      await route.fulfill({ status: 200 });
    } else {
      await route.fulfill({ status: 200, contentType: url.endsWith('.webm') ? 'video/webm' : 'audio/wav', body: files.get(url)! });
    }
  });
  await page.getByLabel('問題文', { exact: true }).fill('この動画に映っている図形は何でしょう？\n'.repeat(30));
  await page.getByLabel('出題形式', { exact: true }).click();
  await page.getByRole('option', { name: '選択問題', exact: true }).click();
  const choices = ['円', '三角形', '四角形', '五角形'];
  for (const [i, choice] of choices.entries()) await page.getByRole('textbox', { name: `選択肢${i + 1}`, exact: true }).fill(choice);
  await page.getByLabel('解答文', { exact: true }).fill('円です。音声も再生できます。');
  await page.getByLabel('問題の動画・音声ファイル').setInputFiles({ name: 'quiz.webm', mimeType: 'video/webm', buffer: video });
  await page.getByLabel('解答の動画・音声ファイル').setInputFiles({ name: 'answer.wav', mimeType: 'audio/wav', buffer: audio });
  await evidence(page, '01-create');
  await page.setViewportSize({ width: 1280, height: 800 });
  const savedResponse = page.waitForResponse((res) => res.url().endsWith('/api/quizzes') && res.request().method() === 'POST');
  await page.getByRole('button', { name: 'この内容で問題を保存する' }).click();
  const saved = await (await savedResponse).json();
  const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360"><circle cx="300" cy="180" r="100" fill="#205649"/></svg>');
  expect((await request.put(`http://localhost:3000/api/quizzes/${saved.id}`, { data: { questionImage: image } })).ok()).toBe(true);
  await page.setViewportSize({ width, height: 800 });
  await expect(page).toHaveURL(dashboard);
  expect(files.size).toBe(2);
  expect(files.get(saved.questionLink)).toEqual(video);
  expect(files.get(saved.answerLink)).toEqual(audio);
  await page.getByRole('button', { name: '問題確認', exact: true }).click();
  await expect(page.locator('video')).toHaveJSProperty('readyState', 4);
  await expect(page.getByRole('list', { name: '選択肢' }).getByRole('listitem')).toHaveText(choices);
  await page.locator('video').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'プレビューを閉じる' })).toBeInViewport();
  await page.locator('video').evaluate((element: HTMLVideoElement) => element.play());
  await expect.poll(() => page.locator('video').evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
  expect((await (await request.get(`http://localhost:3000/api/quizzes/${saved.id}`)).json()).isOpened).toBe(false);
  await page.getByRole('button', { name: 'プレビューを閉じる' }).click();
  await expect(page.locator('video')).toHaveCount(0);
  await page.goto(`/gather/quizzes/${saved.id}`);
  await expect(page.locator('video')).toHaveJSProperty('readyState', 4);
  await page.locator('video').scrollIntoViewIfNeeded();
  await expect(page.getByRole('img', { name: '問題画像', exact: true })).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole('button', { name: '正解を見る' })).toBeInViewport();
  expect(await page.getByRole('region', { name: '本文' }).evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  expect((await (await request.get(`http://localhost:3000/api/quizzes/${saved.id}`)).json()).isOpened).toBe(false);
  await page.locator('video').evaluate((element: HTMLVideoElement) => element.play());
  await expect.poll(async () => (await (await request.get(`http://localhost:3000/api/quizzes/${saved.id}`)).json()).isOpened).toBe(true);
  await evidence(page, '02-video');
  if (process.env.CAPTURE_SLOTS_EVIDENCE) {
    const directory = resolve('docs/evidence/question-slots');
    mkdirSync(directory, { recursive: true });
    await page.screenshot({ path: resolve(directory, `cards-${width}-video.png`), animations: 'disabled' });
  }
  await page.getByRole('button', { name: '正解を見る' }).click();
  await expect(page.locator('video')).toHaveCount(0);
  await page.locator('audio').evaluate((element: HTMLAudioElement) => element.play());
  await expect.poll(() => page.locator('audio').evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
  await evidence(page, '03-audio');
  await page.goto(`${dashboard}/quizzes/new?edit=${saved.id}&order=0&point=10`);
  await expect(page.getByLabel('問題のURL（参考リンク）')).toHaveValue(saved.questionLink);
  await page.getByRole('button', { name: '動画・音声・URLを削除' }).first().click();
  await page.getByLabel('問題のURL（参考リンク）').fill('https://youtu.be/M7lc1UVf-VE');
  await page.getByRole('button', { name: 'この内容で更新する' }).click();
  await expect(page).toHaveURL(dashboard);
  expect((await (await request.get(`http://localhost:3000/api/quizzes/${saved.id}`)).json()).questionLink).toBe('https://youtu.be/M7lc1UVf-VE');
});
}

test('動画404・YouTube遮断を表示し、モバイルでも再試行と画面遷移を操作できる', async ({ page }) => {
  const quiz = { id: 'media-error', point: 10, order: 0, isOpened: false, tournamentId: 't', participantId: 'p', questionText: 'メディア読み込み失敗の検証', questionLink: 'https://example.test/missing.mp4', answerText: '答え' };
  await page.route('**/api/quizzes/media-error', (route) => route.fulfill({ json: quiz }));
  await page.route('https://example.test/**', (route) => route.fulfill({ status: 404 }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/gather/quizzes/media-error');
  await expect(page.getByRole('alert')).toContainText('読み込めませんでした');
  await page.getByRole('button', { name: '再試行' }).click();
  await expect(page.getByRole('alert')).toContainText('読み込めませんでした');
  await expect(page.getByRole('button', { name: '正解を見る' })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await evidence(page, '04-mobile-error');
  quiz.questionLink = 'https://youtu.be/M7lc1UVf-VE';
  await page.route('https://www.youtube.com/iframe_api', (route) => route.abort());
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('YouTubeを読み込めませんでした');
  await expect(page.getByRole('link', { name: 'メディアを別のタブで開く' })).toBeVisible();
  await expect(page.getByRole('button', { name: '正解を見る' })).toBeInViewport();
  await expect(page.getByText('10点問題')).toBeInViewport();
  await evidence(page, '05-youtube-error');
});
