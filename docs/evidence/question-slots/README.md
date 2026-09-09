# ラベル・選択問題の検証

実APIと一時SQLiteを用いたPlaywright E2E、およびStorybookのMSWによる操作検証から生成した画像です。検証用の架空大会を使用しています。

| 画像 | 確認内容 |
| --- | --- |
| 01-tournament.png | 主催者がラベル・配点・通常問題／選択問題を指定。択数の入力はなし |
| 02-creator.png | 参加者が選択肢数を指定。主催者指定の出題形式は変更不可 |
| 03-mobile-edit.png | 390px幅で保存済み選択肢の再編集 |
| 04-question.png | 本番の番号付き選択肢表示 |
| 05-storybook.png | Storybookで保存した4択をプレビュー |
| 08-correct-answer.png | 正解選択肢の番号・内容と従来の解答文を併記 |
| correct-390.png / correct-1280.png | 正解カード・長文の解説・画像の併用 |

再生成（PowerShell、リポジトリルート）:

```powershell
$env:CAPTURE_SLOTS_EVIDENCE='1'
npm run test:e2e -- tests/question-slots.spec.ts
npm run test:storybook --prefix frontend -- question-slots.spec.ts
```

Storybookでは `TournamentForm / ラベル・通常問題と選択問題`、`問題作成 / ラベル付き4択問題を作成`、`選択肢の再編集`、`問題表示 / 音楽・4択問題` を選択できます。ControlsのquestionSlots、label、choiceCount、choicesを変更でき、フォームからの保存・プレビュー・再編集も可能です。

## 選択肢カードと併用パターンの検証

`tests/choice-layout.spec.ts` で320 / 390 / 1280pxの3幅に対して次の8パターン（計24件）を確認します。

- 短文と4択（PCは2列、スマートフォンは1列）
- 長文と4択
- 長文・画像と4択（画像拡大・Escapeで復帰）
- 長文・画像・動画404と4択（エラー表示・再試行）
- 長文・画像・音声と4択（実WAVの再生）
- 長文・YouTube API遮断と4択（エラー表示・再試行）
- 長文・参考リンクと4択
- 20択の長い選択肢（改行なし英字を含む折り返し）

末尾までのスクロール、横方向のはみ出し防止、画像と本文の非重複、「正解を見る」の表示・遷移を検証します。加えて `tests/quiz-media.spec.ts` は390 / 1280pxで長文・4択・画像・実WebM動画の併用、プレビューでの再生、既読制御、解答音声再生、再編集を確認します。YouTube成功再生の外部サービス実接続は今回の自動検証対象外です。

`cards-*-short.png` が装飾済みカード、`cards-*-image.png` が長文と画像、`cards-*-video.png` が実動画と画像の併用です。

```powershell
$env:CAPTURE_SLOTS_EVIDENCE='1'
npm run test:e2e -- tests/choice-layout.spec.ts tests/quiz-media.spec.ts
```

Storybookにも「4択・長文と画像」「4択・長文と画像と動画」「4択・長文と画像と音声」「20択・長い選択肢・スマートフォン」を追加しています。
# 参加者が設定する形式・ログイン情報（追加検証）

最新画像は主催者が通常問題／選択問題を指定し、参加者が択数を2〜20から選ぶ状態。各選択肢は100文字まで入力できる。旧大会の形式未指定枠では従来の形式選択を保持する。
`06-registration.png` は390pxの登録画面、`07-wide.png` は1920pxで1100px上限を超えて広がる選択肢。
E2Eは全40件成功。IDでの再ログイン・パスワード非表示・100文字制限・通常問題への切替を追加検証した。
