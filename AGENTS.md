# GatherQuiz Codex ガイド

このファイルはリポジトリ全体に適用する。`frontend/` または `backend/` を変更するときは、各ディレクトリの `AGENTS.md` も読むこと。各文書は200行以内に保つ。

## プロジェクト概要

GatherQuiz は、参加者が問題を持ち寄り、オフラインのクイズ大会を開催・進行するためのWebアプリケーション。

- 主催者: 大会の作成・編集、参加者の招待、進行管理
- 参加者: 登録・再ログイン、割り当てられた配点の問題作成
- 大会当日: 問題ボード、問題・解答の全画面表示、既読管理

## リポジトリ構成

- `frontend/`: React 18、TypeScript、Vite、MUI、TanStack Query
- `backend/`: Express 5、TypeScript、Prisma 7。ローカル/E2EはSQLite、本番はPostgreSQL
- `tests/`: Playwright E2Eテスト
- `docs/`: 日本語の要件、画面一覧、画面遷移、画面仕様
- `cloudformation/`: Lambda、API Gateway、S3、CloudFront、RDS、VPC
- `.github/workflows/`: PR時のlint・単体テスト、Storybook公開
- `development-plan.md`: 現在の開発状況と残存課題

## 仕様を確認する順序

1. 実行中のコードとテスト
2. `docs/要件定義.md`、`docs/外部仕様/画面遷移.md`、対象画面の仕様
3. `docs/概要.md` と `development-plan.md`
4. `README.md` と旧 `GEMINI.md`

既存文書とコードが食い違う場合は推測で合わせず、差異を報告する。`README.md` に掲載されたルートの `dev:*`、`test:*`、`lint` 等は現在のルート `package.json` には存在しないため、下記の実コマンドを使う。

## 作業方針

- 説明・調査依頼ではコードを変更しない。実装依頼では必要最小限の変更とテストを行う。
- 変更前に類似実装、対象仕様、近接テストを検索する。
- 機能変更は先に失敗するテストを追加・更新し、既存パターンを踏襲して実装する。
- コメントとテスト名は日本語を基本とし、コメントには処理内容より理由を書く。
- TypeScriptを優先し、`unknown` は型ガード等で絞り込む。文字列はシングルクオートを基本とする。
- 関数・クラス・クラスフィールドには、既存方針に合わせてJSDocを付ける。
- 同じ処理の重複は関数へ切り出す。不要になった旧実装や一時ファイルは残さない。
- エラーはメッセージと再現条件を確認し、一度に一つの仮説だけを検証する。
- 秘密情報、実データ、`.env` の内容をコミット・表示しない。
- デプロイ、DBマイグレーション、AWS操作は明示的に依頼された場合だけ行う。
- ユーザーの既存変更を保持し、無関係な整形や修正を混ぜない。

## セットアップ

Node.js 20を基準とする。依存関係はルート、フロントエンド、バックエンドで別管理。

```bash
npm ci
npm ci --prefix frontend
npm ci --prefix backend
```

開発スクリプトとE2E設定は `cp`、`mv`、環境変数の前置記法を使うため、WindowsのPowerShell直下よりDev ContainerまたはWSLを推奨する。`.devcontainer` には古いpnpm/Gemini向け設定も残っているので、実際の `package-lock.json` とnpm scriptsを正とする。

## 検証コマンド

変更範囲に応じて最小の検証から実行し、完了前に該当領域を一通り確認する。

```bash
# フロントエンド
npm run test --prefix frontend
npm run lint --prefix frontend
npm run build --prefix frontend

# バックエンド（Dev Container/WSL）
npm run test --prefix backend
npm run lint --prefix backend
npm run build --prefix backend

# E2E（Dev Container/WSL、ルートから）
npm run test:e2e
```

- 自動修正の `lint-fix` と `format` は変更範囲を確認してから使う。
- バックエンド単体テストとE2Eは `backend/prisma/schema.prisma` を一時差し替えする。中断後は元のスキーマへ復元されていることと、一時DBやバックアップが残っていないことを確認する。
- E2Eはポート3000と5173を使い、Playwright設定が両サーバーを起動する。
- テストを実行できない場合は、未実行のコマンドと理由を報告する。

## 実装上の境界

- ブラウザルートは `/gather` 配下。`frontend/src/helpers/route-helpers.ts` を経由して生成する。
- APIは `/api` 配下。フロントエンドのVite開発サーバーは `/api` を `localhost:3000` へプロキシする。
- フロントエンドのAPI通信は `frontend/src/api/` に集約し、ページやコンポーネントから直接HTTP通信しない。
- バックエンドは route → model/Prisma の現行構造を守り、非同期routeは共通エラーハンドラーへ渡す。
- 大会、参加者、クイズの関係や制約を変える場合は、全Prismaスキーマ、APIモデル、フロントモデル、テストを同時に確認する。

## 関連文書

- [プロジェクト概要](docs/概要.md)
- [要件定義](docs/要件定義.md)
- [画面一覧](docs/外部仕様/画面一覧.md)
- [画面遷移](docs/外部仕様/画面遷移.md)
- [開発計画](development-plan.md)
- [フロントエンド規約](frontend/AGENTS.md)
- [バックエンド規約](backend/AGENTS.md)

