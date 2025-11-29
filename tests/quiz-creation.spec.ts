import { test, expect } from '@playwright/test';

let tournamentId: string;
let participantId: string;

// Setup: Create a tournament and a participant before the test
test.beforeAll(async ({ request }) => {
  const tournamentRes = await request.post('http://localhost:3000/api/tournaments', {
    data: {
      name: `Quiz Creation Test Tournament ${Date.now()}`,
      password: 'test-password',
      questionsPerParticipant: 1,
      points: '10',
    },
  });
  const tournament = await tournamentRes.json();
  tournamentId = tournament.id;

  const participantRes = await request.post(`http://localhost:3000/api/tournaments/${tournamentId}/participants`, {
    data: { name: 'QuizCreator' },
  });
  const participant = await participantRes.json();
  participantId = participant.id;
});

test.describe('クイズ作成フロー', () => {
  test('参加者が画像付きの新しいクイズを作成できること', async ({ page }) => {
    // Mock S3 upload flow
    const dummySignedUrl = 'https://dummy-bucket.s3.ap-northeast-1.amazonaws.com/uploads/dummy.png';
    const dummyObjectUrl = 'https://dummy-bucket.s3.ap-northeast-1.amazonaws.com/uploads/dummy-object.png';

    // 1. Mock the API request to get signed URL
    await page.route('/api/upload/image', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          signedUrl: dummySignedUrl,
          objectUrl: dummyObjectUrl,
        }),
      });
    });

    // 2. Mock the PUT request to S3 (the signed URL)
    await page.route(dummySignedUrl, async (route) => {
      await route.fulfill({
        status: 200,
      });
    });

    // 3. Navigate to the quiz creation page
    await page.goto(`/gather/tournaments/${tournamentId}/participants/${participantId}/quizzes/new`);
    await expect(page.getByRole('heading', { name: '問題作成・編集' })).toBeVisible();

    // 4. Fill out the form
    const questionText = 'これはなんの画像？';
    const answerText = 'テスト画像';
    await page.getByLabel('配点').fill('10');
    await page.getByRole('textbox', { name: '問題文' }).fill(questionText);
    await page.getByRole('textbox', { name: '解答文' }).fill(answerText);

    // 5. Upload image
    // Create a dummy image buffer (1x1 PNG)
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    
    // "添付画像を選択"ボタンに関連付けられた隠しinput要素を探してファイルをセット
    // ボタンのラベルテキストから親のlabel要素を見つけ、その中のinput[type="file"]をターゲットにする
    const fileInput = page.locator('input[type="file"]').first(); // 問題画像のinput
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: buffer,
    });

    // Verify file selection (optional, if UI displays file name)
    await expect(page.getByText('選択中のファイル: test-image.png')).toBeVisible();

    // 6. Submit the form
    await page.getByRole('button', { name: 'この内容で問題を保存する' }).click();

    // 7. Assert navigation to the participant dashboard
    await page.waitForURL(`/gather/tournaments/${tournamentId}/participants/${participantId}`);
    await expect(page.getByRole('heading', { name: '参加者ダッシュボード' })).toBeVisible();

    // 8. Verify the created quiz is displayed on the dashboard
    await expect(page.getByText(questionText)).toBeVisible();
    await expect(page.getByText(`正解: ${answerText}`)).toBeVisible();
    await expect(page.getByText('あと 0 問、作成してください。')).toBeVisible();
  });
});