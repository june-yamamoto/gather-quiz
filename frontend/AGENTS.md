# フロントエンド Codex ガイド

このファイルは `frontend/` 配下に適用し、ルートの `AGENTS.md` を補足する。

## 構成

- `src/pages/`: React Routerから呼ばれる画面単位のコンポーネント
- `src/components/`: 共通部品と画面ロジック。`design-system/` は再利用UI
- `src/api/`: Axiosクライアント。HTTP通信はここへ集約する
- `src/models/`: APIレスポンスを画面用モデルへ変換するクラス
- `src/helpers/route-helpers.ts`: `/gather` 配下の画面URL生成
- `src/stories/`: ページ・共通部品のStorybook
- `src/pages/__test__/` と `*.test.ts(x)`: Vitest/Testing Libraryテスト
- `src/theme.ts`: MUIテーマ

## 実装規約

- 関数コンポーネントはアロー関数で記述し、propsの型を明示する。
- ページはルーティングと画面構成を担い、再利用可能な表示やロジックは `components/` へ分離する。
- APIを追加・変更するときは `src/api/`、`src/models/`、利用ページ、モック、テストをセットで確認する。
- サーバー状態にはTanStack Queryを使い、既存のquery key・invalidateパターンを踏襲する。
- 画面遷移には `src/helpers/route-helpers.ts` を使い、パス文字列を重複させない。
- MUIとEmotionの既存テーマ・styledパターンを優先し、独自色や場当たり的なinline styleを増やさない。
- 利用者向け文言とテストケース名は日本語を基本とする。
- 新しい画面または重要な画面状態にはStorybook storyを用意する。API依存はモックし、主要状態を単独表示できるようにする。
- 主要ロジックと各コンポーネントにテストを用意し、意味のないテストスキップやカバレッジ目標の引き下げは行わない。

## APIと環境

- `VITE_API_BASE_URL` があればAxiosのbase URLに使い、未設定時は `/` を使う。
- ローカル開発ではViteが `/api` を `http://localhost:3000` に転送する。
- APIエラーは `src/errors/ApiError.ts` に変換する既存方式を維持する。
- 画像アップロードはAPIからS3署名付きURLを取得後、ブラウザからS3へPUTする。

## コマンド

ルートから実行する場合:

```bash
npm run dev --prefix frontend
npm run test --prefix frontend
npm run test:watch --prefix frontend
npm run lint --prefix frontend
npm run build --prefix frontend
npm run storybook --prefix frontend
```

変更後は少なくとも関連テストとlintを実行する。ルート・型・ビルド設定に影響する変更ではbuildも実行し、主要ユーザーフローの変更ではルートのPlaywright E2Eも実行する。

## 仕様参照

対象画面に対応する `../docs/外部仕様/画面仕様/` の文書と、`../docs/外部仕様/画面遷移.md` を先に読む。仕様にない挙動を追加する場合は、実装と同時に該当文書を更新する。

