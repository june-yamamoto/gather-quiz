import { test, expect, type Page } from '@playwright/test';

/** managerを読み直さず、実際のサイドバーリンクからStoryを切り替える。 */
const selectStory = async (page: Page, id: string) => {
  await page.locator(`a[href="/?path=/story/${id}"]`).click();
};

test('問題文を個別Controlsで変更するとその場で表示が更新される', async ({ page }) => {
  await page.goto('/?path=/story/コンポーネント-quizdisplaycontainer--default');
  const row = page.getByRole('row').filter({ hasText: 'questionText' });
  await row.getByRole('textbox').fill('Controlsで変更した問題');
  await expect(page.frameLocator('#storybook-preview-iframe').getByText('Controlsで変更した問題')).toBeVisible();
});

test('問題から解答・ボードに遷移してもモックが維持される', async ({ page }) => {
  await page.goto('/?path=/story/画面-大会実施-問題表示--default');
  const canvas = page.frameLocator('#storybook-preview-iframe');
  await canvas.getByRole('button', { name: '正解を見る' }).click();
  await expect(canvas.getByText('茶道')).toBeVisible();
  await canvas.getByRole('button', { name: 'ボードに戻る' }).click();
  await expect(canvas.getByRole('heading', { name: '週末の持ち寄りクイズ大会' })).toBeVisible();
});

test('同じiframeでエラー・読み込みから通常状態へ切り替えられる', async ({ page }) => {
  await page.goto('/?path=/story/画面-大会実施-解答表示--default');
  const canvas = page.frameLocator('#storybook-preview-iframe');
  await selectStory(page, '画面-大会実施-解答表示--failure');
  await expect(canvas.getByText(/エラー:/)).toBeVisible();
  await selectStory(page, '画面-大会実施-解答表示--default');
  await expect(canvas.getByText('茶道')).toBeVisible();
  await selectStory(page, '画面-大会実施-解答表示--loading');
  await expect(canvas.getByRole('progressbar')).toBeVisible();
  await selectStory(page, '画面-大会実施-解答表示--default');
  await expect(canvas.getByText('茶道')).toBeVisible();
});

for (const id of ['コンポーネント-answerdisplaycontainer--default', 'コンポーネント-quizpreviewdialog--answer', '画面-大会実施-解答表示--default']) {
  test(`${id}の解答Controlsが即座に反映される`, async ({ page }) => {
    await page.goto(`/?path=/story/${id}`);
    await page.getByRole('row').filter({ hasText: 'answerText' }).getByRole('textbox').fill('変更した答え');
    await expect(page.frameLocator('#storybook-preview-iframe').getByText('変更した答え')).toBeVisible();
  });
}

test('Docsで複数のプレビューが同時に表示されてもモックが干渉しない', async ({ page }) => {
  await page.goto('/?path=/docs/コンポーネント-quizpreviewdialog--docs');
  const docs = page.frameLocator('#storybook-preview-iframe');
  await expect(docs.locator('iframe')).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) {
    await docs.locator('iframe').nth(index).scrollIntoViewIfNeeded();
    const story = docs.frameLocator('iframe').nth(index);
    await expect(story.getByRole('dialog')).toBeVisible();
    await expect(story.getByText(/エラー:/)).toHaveCount(0);
    await expect(story.getByText(index === 2 ? '茶道' : /一期一会/)).toBeVisible();
  }
});

test('全Storyを同じiframe内で順に切り替え、意図しないAPIエラーが出ない', async ({ page, request }) => {
  test.setTimeout(180000);
  const index = await (await request.get('/index.json')).json();
  const stories = Object.values(index.entries) as { id: string; type: string; name: string }[];
  const unhandled: string[] = [];
  page.on('console', (message) => {
    if (/without a matching request handler|Failed to execute.*onUnhandledRequest/.test(message.text())) unhandled.push(message.text());
  });
  let group = '';
  for (const story of stories.filter((entry) => entry.type === 'story')) {
    const nextGroup = story.id.split('--')[0];
    if (group !== nextGroup) {
      await page.goto(`/?path=/story/${story.id}`);
      group = nextGroup;
    } else await selectStory(page, story.id);
    const canvas = page.frameLocator('#storybook-preview-iframe');
    await expect(canvas.locator(`[data-story-id="${story.id}"]`)).toBeAttached();
    if (/--loading$/.test(story.id)) await expect(canvas.getByRole('progressbar')).toBeVisible();
    else {
      await expect(canvas.getByRole('progressbar')).toHaveCount(0);
      if (/--failure$/.test(story.id)) await expect(canvas.getByText(/エラー:/)).toBeVisible();
      else await expect(canvas.getByText(/エラー:|モックの対象データがありません|Invalid .*data format/)).toHaveCount(0);
    }
    await expect(canvas.locator('.sb-errordisplay')).not.toBeVisible();
  }
  expect(unhandled).toEqual([]);
});

test('解答画面のDocsでエラー・読み込みStoryが通常Storyを汚染しない', async ({ page }) => {
  await page.goto('/?path=/docs/画面-大会実施-解答表示--docs');
  const docs = page.frameLocator('#storybook-preview-iframe');
  await expect(docs.locator('iframe')).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    const iframe = docs.locator('iframe').nth(index);
    await iframe.scrollIntoViewIfNeeded();
    const story = docs.frameLocator('iframe').nth(index);
    const src = await iframe.getAttribute('src');
    if (src?.includes('--failure')) await expect(story.getByText(/エラー:/)).toBeVisible();
    else if (src?.includes('--loading')) await expect(story.getByRole('progressbar')).toBeVisible();
    else await expect(story.getByText('茶道')).toBeVisible();
  }
  await expect(docs.frameLocator('iframe').first().getByText('茶道')).toBeVisible();
});
