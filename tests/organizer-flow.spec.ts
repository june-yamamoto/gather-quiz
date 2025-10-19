import { test, expect, Page } from '@playwright/test';

const createTournamentFromUI = async (page: Page, tournamentName: string) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'クイズ大会を新しく作成する' }).click();
  await page.waitForURL('/tournaments/new');

  await page.getByLabel('大会名').fill(tournamentName);
  await page.getByLabel('管理用パスワード').fill('organizer-password');
  await page.getByLabel('参加者1人あたりの問題作成数').fill('2');
  await page.getByLabel('各問題の配点 (カンマ区切り)').fill('10,20');
  await page.getByRole('button', { name: 'この内容で大会を作成する' }).click();

  await page.waitForURL(new RegExp('/tournaments/.*/created'));
  const url = page.url();
  return url.split('/')[4]; // Extract tournament ID from URL
};

const registerParticipant = async (page: Page, tournamentId: string, participantName: string) => {
  await page.goto(`/tournaments/${tournamentId}`);
  await page.getByRole('link', { name: '参加者として新規登録' }).click();
  await page.waitForURL(`/tournaments/${tournamentId}/register`);
  await page.getByLabel('あなたの名前').fill(participantName);
  await page.getByRole('button', { name: 'この名前で参加する' }).click();
  await page.waitForURL(`/tournaments/${tournamentId}/quizzes/new`);
};

test.describe('主催者ログインとダッシュボードフロー', () => {
  test('主催者がログインして正しいダッシュボードのステータスを確認できること', async ({ page }) => {
    const tournamentName = `Organizer UI Flow Test ${Date.now()}`;
    
    // 1. Create a tournament via UI and get its ID
    const tournamentId = await createTournamentFromUI(page, tournamentName);

    // 2. Register participants
    await registerParticipant(page, tournamentId, 'Participant A');
    await registerParticipant(page, tournamentId, 'Participant B');

    // 3. Navigate to the portal and log in as organizer
    await page.goto(`/tournaments/${tournamentId}`);
    await page.getByRole('button', { name: '主催者としてログイン' }).click();
    await page.getByLabel('管理用パスワード').fill('organizer-password');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // 4. Assert navigation to the admin dashboard
    await page.waitForURL(`/tournaments/${tournamentId}/admin`);
    await expect(page.getByRole('heading', { name: `管理ページ: ${tournamentName}` })).toBeVisible();

    // 5. Verify the displayed data
    await expect(page.getByText('Participant A')).toBeVisible();
    await expect(page.getByText('0 / 2 問')).toBeVisible();
    await expect(page.getByText('Participant B')).toBeVisible();
    // Note: We can't easily test the submission count without creating quizzes via UI,
    // so we just check for presence.
  });
});