# ラベル・選択問題の検証

実APIと一時SQLiteを用いたPlaywright E2E、およびStorybookのMSWによる操作検証から生成した画像です。検証用の架空大会を使用しています。

| 画像 | 確認内容 |
| --- | --- |
| 01-tournament.png | 声優10点・音楽10点・声優20点・音楽20点、通常／4択／3択の混在 |
| 02-creator.png | 参加者のラベル・指定4択・解答入力 |
| 03-mobile-edit.png | 390px幅で保存済み選択肢の再編集 |
| 04-question.png | 本番の番号付き選択肢表示 |
| 05-storybook.png | Storybookで保存した4択をプレビュー |

再生成（PowerShell、リポジトリルート）:

```powershell
$env:CAPTURE_SLOTS_EVIDENCE='1'
npm run test:e2e -- tests/question-slots.spec.ts
npm run test:storybook --prefix frontend -- question-slots.spec.ts
```

Storybookでは `TournamentForm / ラベル・通常問題と選択問題`、`問題作成 / ラベル付き4択問題を作成`、`選択肢の再編集`、`問題表示 / 音楽・4択問題` を選択できます。ControlsのquestionSlots、label、choiceCount、choicesを変更でき、フォームからの保存・プレビュー・再編集も可能です。
