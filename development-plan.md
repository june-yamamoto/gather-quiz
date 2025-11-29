# GatherQuiz 開発計画書

## 1. 開発の概要

ドキュメントに基づき、本アプリケーション「GatherQuiz」を以下の技術スタックと方針で開発する。

- **技術スタック**:
    - **フロントエンド**: React (TypeScript) + Vite
        - UIフレームワーク: Material-UI (MUI) with Emotion `styled` API
        - ルーティング: React Router
        - データ取得: TanStack Query (React Query)
    - **バックエンド**: Node.js (TypeScript) + Express
        - データベース: SQLite (開発時), PostgreSQL (本番想定)
        - ORM: Prisma
    - **パッケージ管理**: npm (各パッケージで独立して管理)

---

### 静的解析とテストの実行コマンドについて

プロジェクト全体の静的解析 (lint, format) およびテスト (test) を実行する場合、以下のルートコマンドを使用します。
これらのコマンドは、backend および frontend の各パッケージで定義された対応するスクリプトを呼び出します。

- **静的解析の実行**:
    - `npm run lint`
    - `npm run lint-fix`
    - `npm run format`
- **テストの実行**:
    - `npm test` (または `npm run test:all`)

各パッケージ単体で実行する場合は、それぞれのディレクトリに移動して `npm run <script-name>` を実行してください。

---

## 2. 現在の進捗

- **フェーズ1: プロジェクト基盤の構築**: ✅ 完了
- **フェーズ2: 主要機能の実装**: ✅ 完了
- **フェーズ3: 大会実施機能と仕上げ**: ✅ 完了
- **フェーズ4: リファクタリング**: ✅ 完了

---

## 3. 開発フェーズ

### フェーズ1: プロジェクト基盤の構築 (完了)

アプリケーションの土台となる開発環境と基本構造を整備した。

- ✅ pnpmワークスペースの初期設定
- ✅ バックエンドプロジェクトのセットアップ (Express, TypeScript, Prisma, SQLite)
- ✅ フロントエンドプロジェクトのセットアップ (React, TypeScript, Vite, React Router, MUI)
- ✅ APIの基本設計と疎通確認
- ✅ Dev Containerによる開発環境のコンテナ化
- ✅ Vitestによる単体テスト基盤の導入 (フロントエンド・バックエンド)

### フェーズ2: 主要機能の実装 (完了)

要件定義に基づき、主催者と参加者のコアとなる機能を実装した。

- **大会作成フローの実装 (完了)**
    - ✅ **画面**: `サービスTOPページ`, `大会作成ページ`, `大会作成完了ページ`
    - ✅ **API**: 大会情報の保存 (`POST /api/tournaments`), 取得 (`GET /api/tournaments/:id`)
- **参加者フローの実装 (完了)**
    - ✅ **画面**: `大会ポータルページ`, `参加者登録ページ`, `問題作成・編集ページ`, `参加者ダッシュボードページ`
    - ✅ **API**: 参加者の登録 (`POST /api/tournaments/:id/participants`), 問題の作成 (`POST /api/quizzes`), 参加者の問題作成状況の取得 (`GET /api/tournaments/:tournamentId/participants/:participantId/quizzes`)
- **主催者管理フローの実装 (完了)**
    - ✅ **画面**: `主催者用 管理ページ` (ログイン機能、大会情報編集機能含む)
    - ✅ **API**: 主催者ログイン (`POST /tournaments/:id/login`), 参加状況の取得 (`GET /tournaments/:id/status`), 大会情報の更新 (`PUT /tournaments/:id`), 大会開始 (`PATCH /tournaments/:id/start`)

### フェーズ3: 大会実施機能と仕上げ (完了)

- **大会実施フローの実装 (完了)**
    - ✅ **画面**: `問題選択ボードページ`, `問題表示ページ`, `解答表示ページ`
    - ✅ **API**: 大会ボード情報の取得 (`GET /tournaments/:id/board`), 個別クイズ情報の取得 (`GET /quizzes/:id`)
- **共通機能の実装 (完了)**
    - ✅ `エラーページ` の作成とルーティング設定。
    - ✅ 画像アップロード機能の実装 (S3への署名付きURL方式)

### フェーズ4: リファクタリング (完了)

コードの品質向上と保守性向上のため、以下のリファクタリングを実施した。

- **バックエンド**
    - ✅ **モデルのクラス化**: DBモデルを`backend/src/model`配下にクラスとして切り出し、Prismaの生オブジェクトから変換して利用するように修正。
    - ✅ **エラーハンドリングの共通化**: `try-catch`ブロックを削減し、Expressの共通エラーハンドリングミドルウェアに処理を統一。
- **フロントエンド**
    - ✅ **データ取得ライブラリ導入**: 当初作成した`useApi`カスタムフックを廃止し、より高機能な`TanStack Query`を導入。キャッシュ機構を活用し、パフォーマンスとUXを向上。
    - ✅ **Styled-Components命名規則の適用**: `styled`で生成したコンポーネントには`Styled`プレフィックスを付与する規約を徹底。

---

## 4. サーバーレスアーキテクチャへの移行 (中断中)

**目的:** 開発環境の運用コスト削減と、本番環境を見据えたモダンなサーバーレス構成への移行。

**現状:**
- **dev環境リソースの全削除**: デバッグと構成見直しのため、`gather-quiz-frontend-dev`, `gather-quiz-backend-lambda-dev`, `gather-quiz-rds-dev`, `gather-quiz-vpc-dev` の全CloudFormationスタックを削除しました。
- **フロントエンド設定変更**: APIリクエスト先を環境変数 `VITE_API_BASE_URL` で制御するように修正し、CloudFrontのカスタムドメイン設定を一時的に無効化しました。
- **パッケージ管理**: モノレポ構成を解体し、npm ベースの個別パッケージ管理に移行完了。

**主な作業内容:**
- ✅ **パッケージ分離とnpm移行**: `packages/backend`, `packages/frontend` をルート直下に移動し、pnpm から npm へ移行。
- ✅ **Backend Lambda対応**: `Dockerfile`, `lambda.ts`, `schema.prisma` などを修正し、Prisma Client の初期化エラー (P1010) の解決に向けた調整を実施。
- ✅ **Frontend API設定**: `src/api/*ApiClient.ts` の `baseURL` を修正し、環境変数経由でエンドポイントを指定可能に。
- ✅ **dev環境クリーンアップ**: 既存の CloudFormation スタックをすべて削除。
- ✅ **CloudFormationテンプレートとパラメータの整理**:
    - パラメータファイルをルート直下から `cloudformation/parameters/` ディレクトリへ移動。
    - `apprunner-stack.yaml` を削除し、Lambda/API Gateway構成へ一本化。
    - 各テンプレート(`vpc-stack.yaml`, `backend-lambda-stack.yaml`, `frontend-stack.yaml`等)のDescriptionを日本語化し、不要なコメントアウトを整理。
    - **構成変更**: コスト削減のため、LambdaをVPC外に配置し、RDSをパブリックアクセス可能に変更（`vpc-stack.yaml`の簡素化）。
- ✅ **バックエンドのSecrets Manager対応とルーティング修正**:
    - Lambda環境でDB認証情報をSecrets Managerから取得するように `db.ts` と `lambda.ts` を修正。
    - ローカル開発環境とLambda環境のパス整合性を取るため、バックエンドのルーターを `/api` プレフィックス配下にマウントするように修正。
    - `frontend/.env` を作成し、Viteのプロキシ設定と整合性を確保。
    - E2Eテストがパスすることを確認。

---

## 5. 今後の開発計画

### 5.1. 新バックエンドへの完全移行 (再デプロイ)

1.  [ ] **インフラ再構築**:
    - `gather-quiz-vpc-dev`, `gather-quiz-rds-dev`, `gather-quiz-backend-lambda-dev`, `gather-quiz-frontend-dev` スタックを順次再デプロイする。
2.  [ ] **動作確認**:
    - 再デプロイされた環境で、Lambda関数が正常に起動し、データベース接続 (P1010エラーの解消) が成功することを確認する。
    - フロントエンドからAPIへの接続を確認する。
3.  [ ] **E2Eテストの実施**:
    - 新しいアーキテクチャで、既存のE2Eテストがすべてパスすることを確認する。

### 5.2. バックログタスク

- [ ] **CI/CDの構築**: `main`ブランチへのマージ時に自動デプロイするGitHub Actionsを構築する。
- [ ] **画像アップロード機能のインフラ構築**: 本番環境用の画像アップロード基盤を構築する。
- [ ] **UI/UXの全体的改善**: 保留中のUI/UX改善タスク（ヘッダー/フッター導入、デザイン精緻化、レスポンシブ対応）に着手する。

---

## 6. デプロイ状況 (2025/11/24時点)

### 6.1. フロントエンド (開発環境)

- ⚠️ **ステータス**: **未デプロイ** (スタック削除済み)
- **インフラ**: S3 + CloudFront (`gather-quiz-frontend-dev`)

### 6.2. バックエンド (新構成: Lambda)

- ⚠️ **ステータス**: **未デプロイ** (スタック削除済み)
- **インフラ**: API Gateway + Lambda (`gather-quiz-backend-lambda-dev`)

### 6.3. バックエンド (旧構成: App Runner)

- ⛔ **ステータス**: **廃止** (スタック削除済み)

### 6.4. 共通インフラ

- ⚠️ **ステータス**: **未デプロイ** (スタック削除済み)
- **ネットワーク**: VPC (`gather-quiz-vpc-dev`)
- **データベース**: RDS PostgreSQL (`gather-quiz-rds-dev`)
- **成果物格納場所**: S3 (`gather-quiz-lambda-artifacts-251108`)