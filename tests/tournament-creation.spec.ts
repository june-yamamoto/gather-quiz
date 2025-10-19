import { test, expect, Page } from '@playwright/test';

// A helper function to make the test more readable
const createTournament = async (page: Page, tournamentName: string) => {
  // Go to the top page
  await page.goto('/');

  // Click the button to create a new tournament
  await page.getByRole('link', { name: 'クイズ大会を新しく作成する' }).click();
  await page.waitForURL('/tournaments/new');

  // Fill out the form
  await page.getByRole('textbox', { name: '大会名' }).fill(tournamentName);
  await page.getByRole('textbox', { name: '管理用パスワード' }).fill('password123');
  await page.getByRole('spinbutton', { name: '参加者1人あたりの問題作成数' }).fill('5');
  await page.getByRole('textbox', { name: '各問題の配点 (カンマ区切り)' }).fill('10,20,30,40,50');
  await page.getByRole('textbox', { name: 'レギュレーション' }).fill('This is a test regulation.');

  // Submit the form
  await page.getByRole('button', { name: 'この内容で大会を作成する' }).click();
};

test.describe('大会作成フロー', () => {
  test('ユーザーが新しい大会を作成できること', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const tournamentName = `My New E2E Test ${Date.now()}`;

    // Run the creation helper
    await createTournament(page, tournamentName);

    // Verify the completion page
    await page.waitForURL(new RegExp('/tournaments/.*/created'));
    await expect(page.getByRole('heading', { name: 'クイズ大会の作成が完了しました！' })).toBeVisible();

    // Check that the tournament name is displayed
    await expect(page.getByText(`大会名: ${tournamentName}`)).toBeVisible();

    // Check that the portal URL is displayed and correct
    const portalUrlLocator = page.getByText(/http:\/\/localhost:5173\/tournaments\/.*/);
    await expect(portalUrlLocator).toBeVisible();
    const portalUrl = await portalUrlLocator.textContent();
    expect(portalUrl).toContain('/tournaments/');


    // Check that the password is displayed (as passed in state)
    await expect(page.getByText(/password123/)).toBeVisible();

    // Test the "copy" button
    await page.getByRole('button', { name: 'コピー' }).click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toEqual(portalUrl);
  });
});
