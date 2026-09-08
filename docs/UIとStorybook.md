# UIとStorybookの確認

## スタイル

- `frontend/src/theme.ts` に色、文字、角丸、フォーカス、操作サイズを集約する。
- 深いグリーンを主操作、茶色を補助アクセントとし、薄い背景と罫線で情報を区切る。
- 参加者の入力は16px以上、ボタンは44px以上。320px・375px幅の登録→入力→保存をE2Eで確認する。
- 投影画面は画面サイズに応じた文字を使い、スマートフォンのプレビューでも最小文字サイズを確保する。

## 起動と検証

```bash
npm run storybook --prefix frontend
npm run build-storybook --prefix frontend
npm run test:storybook --prefix frontend
npm run test --prefix frontend
npm run lint --prefix frontend
npm run build --prefix frontend
npm run test:e2e
```

Storybookは `http://localhost:6006`。全15ページと共通コンポーネントを `src/stories/` に収録する。
大会終了、登録完了、ログインダイアログは操作を再現するplay関数から表示する。
画面の通常・スマートフォン表示、API依存画面の読み込み・エラー、編集や問題作成状況を選んで確認できる。

`fixtures.ts` は架空の初期データ、`mock-api.ts` は状態を持つMSWハンドラーを定義する。古い `mockData` パラメーターは使わない。
各Storyに独立したQueryClientとモックデータを作る。StoryやControlsの変更では子画面を一旦外し、ハンドラーの設定後に再表示する。
同じStory内の画面遷移ではデータを維持し、問題保存や既読を遷移先に反映する。別Storyに切り替えると初期化する。
Docs内はStoryごとにiframeを分ける。エラー・読み込み用のハンドラーや全画面ダイアログが、他のStoryへ影響しない。
Docsは状態の一覧表示に使い、内容の編集は「CanvasのControlsを開く」リンクか各StoryのCanvasから行う。
問題・解答の文面、画像URL、配点、ジャンル、大会名やルール等は、クラスインスタンスを渡さず個別Controlsにする。
`QuizPreviewDialog`の各Storyは内容を表示する。APIエラー・読み込み状態は画面Storyで明示的に確認する。
`test:storybook`はmanagerのサイドバーで同じiframeを切り替え、Controls編集、Docs同時表示、アプリ内の画面遷移を検証する。
APIリクエストに未定義のモックがあればエラーにし、実APIへ送信しない。
新しいAPI通信を追加したら、その操作用のハンドラーも用意する。

## 既読の回帰確認

- 編集・プレビュー・GET/HEAD取得では既読を変更しない。
- 本番問題の描画と画像読み込み成功、タブ表示を確認してから専用PUTで保存する。
- 画像失敗、表示前の離脱、非表示タブでは記録しない。
- 保存失敗は警告し、利用者が再試行できる。成功時は問題ボードを再取得対象にする。
- 過去に誤って付いた既読は自動解除しない。今回の変更にDB移行は不要。
