import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { outputs } from './aws.ts';
import { frontendAuthorization } from './frontend-auth.ts';

const state = await outputs();
const browser = await chromium.launch();
try {
  const authorization = await frontendAuthorization();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    httpCredentials: authorization ? {
      username: 'dev', password: Buffer.from(authorization.slice(6), 'base64').toString().slice(4), origin: state.Url,
    } : undefined,
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.name));
  await page.goto(state.Url);
  await page.getByRole('link', { name: 'クイズ大会を新しく作成する' }).click();
  await page.getByRole('textbox', { name: '大会名' }).waitFor();
  await page.reload();
  await page.getByRole('spinbutton', { name: '1問目の配点' }).waitFor();
  if (errors.length) throw new Error(`Browser runtime errors: ${errors.join(',')}`);
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/deployed-form.png', fullPage: true });
  console.log('Deployed browser navigation and deep-link reload: passed');
} finally { await browser.close(); }
