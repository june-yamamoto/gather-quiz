import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { makeAudio } from './helpers/media';

const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360"><rect width="600" height="360" fill="#E4EFE9"/><circle cx="300" cy="180" r="100" fill="#205649"/></svg>');
const patterns = ['短文', '長文', '画像', '動画エラーと画像', '音声と画像', 'YouTube遮断', '参考リンク', '20択・長い選択肢'] as const;

for (const width of [320, 390, 1280]) {
  for (const pattern of patterns) {
    test(`${width}px・${pattern}で選択肢とメディアを操作できる`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 1280 ? 900 : 740 });
      const count = pattern.startsWith('20択') ? 20 : 4;
      const withImage = pattern.includes('画像');
      const choices = count === 4 ? ['ピアノ', 'バイオリン', 'フルート', 'トランペット'] : Array.from({ length: count }, (_, i) => `${i + 1}番目の選択肢` + '長い説明文'.repeat(40) + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(3));
      const quiz = { id: 'layout', point: 10, order: 0, isOpened: false, tournamentId: 't', participantId: 'p',
        label: '音楽', choiceCount: count, choices, answerText: '正解は2番です。',
        questionText: pattern === '短文' ? 'この楽器はどれでしょう？' : '長い問題文の途中でも、選択肢とメディアを確認できます。\n'.repeat(35),
        questionImage: withImage ? image : null,
        questionLink: pattern.includes('動画') ? 'https://layout.test/missing.mp4' : pattern.includes('音声') ? 'https://layout.test/sound.wav' : pattern.includes('YouTube') ? 'https://youtu.be/M7lc1UVf-VE' : pattern.includes('リンク') ? 'https://example.com/reference' : null,
      };
      await page.route('**/api/quizzes/layout', route => route.fulfill({ json: quiz }));
      await page.route('**/api/quizzes/layout/opened', route => route.fulfill({ json: { ...quiz, isOpened: true } }));
      await page.route('https://layout.test/missing.mp4', route => route.fulfill({ status: 404 }));
      // WAVを実際にデコード・再生し、外部素材の可用性に依存しない。
      const wav = makeAudio();
      await page.route('https://layout.test/sound.wav', route => route.fulfill({ contentType: 'audio/wav', body: wav }));
      await page.route('https://www.youtube.com/iframe_api', route => route.abort());
      await page.goto('/gather/quizzes/layout');
      const region = page.getByRole('region', { name: '本文' });
      const list = page.getByRole('list', { name: '選択肢' });
      const items = list.getByRole('listitem');
      await expect(items).toHaveCount(count);
      await expect(items).toHaveText(choices);
      if (pattern === '短文') {
        const first = await items.nth(0).boundingBox();
        const second = await items.nth(1).boundingBox();
        if (width >= 600) expect(second!.y).toBeCloseTo(first!.y, 0);
        else expect(second!.y).toBeGreaterThan(first!.y + first!.height);
      }
      await items.last().scrollIntoViewIfNeeded();
      const bounds = await region.boundingBox();
      const last = await items.last().boundingBox();
      expect(last!.y).toBeLessThan(bounds!.y + bounds!.height);
      // 選択肢自体が画面より長くても、末尾へスクロールできる。
      await region.evaluate(element => { element.scrollTop = element.scrollHeight; });
      expect(await region.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByRole('button', { name: '正解を見る' })).toBeInViewport();
      if (withImage) {
        const picture = page.getByRole('img', { name: '問題画像', exact: true });
        await expect(picture).toBeInViewport({ ratio: 1 });
        const pictureBounds = await picture.boundingBox();
        expect(pictureBounds!.y).toBeGreaterThanOrEqual(bounds!.y + bounds!.height - 1);
        await page.getByRole('button', { name: /画像を拡大/ }).click();
        await expect(page.getByRole('dialog', { name: '画像の拡大表示' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(picture).toBeVisible();
      }
      if (pattern.includes('音声')) {
        await page.locator('audio').evaluate((element: HTMLAudioElement) => element.play());
        await expect.poll(() => page.locator('audio').evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
      }
      if (pattern.includes('エラー') || pattern.includes('遮断')) {
        await expect(page.getByRole('alert')).toBeVisible();
        await page.getByRole('button', { name: '再試行' }).click();
        await expect(page.getByRole('alert')).toBeVisible();
      }
      if (process.env.CAPTURE_SLOTS_EVIDENCE && ['短文', '画像'].includes(pattern) && width !== 320) {
        await items.first().scrollIntoViewIfNeeded();
        const directory = resolve('docs/evidence/question-slots');
        mkdirSync(directory, { recursive: true });
        await page.screenshot({ path: resolve(directory, `cards-${width}-${pattern === '短文' ? 'short' : 'image'}.png`), animations: 'disabled' });
      }
      await page.getByRole('button', { name: '正解を見る' }).click();
      await expect(page.getByText('正解は2番です。', { exact: true })).toBeVisible();
      await expect(page.locator('audio,video')).toHaveCount(0);
    });
  }
}
