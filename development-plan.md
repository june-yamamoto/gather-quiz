# GatherQuiz 開発計画書

## 1. 開発の概要

ドキュメントに基づき、本アプリケーション「GatherQuiz」を以下の技術スタックと方針で開発する。

- **モノリポ構成**: フロントエンド、バックエンド、データベース関連のプロジェクトを一つのリポジトリ内で個別のディレクトリとして管理する。
- **技術スタック**:
    - **フロントエンド**: React (TypeScript) + Vite
        - UIフレームワーク: Material-UI (MUI) with Emotion `styled` API
        - ルーティング: React Router
        - データ取得: TanStack Query (React Query)
    - **バックエンド**: Node.js (TypeScript) + Express
        - データベース: SQLite (開発時), PostgreSQL (本番想定)
        - ORM: Prisma
    - **パッケージ管理**: pnpm (ワークスペース機能を利用)

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

## 4. サーバーレスアーキテクチャへの移行 (完了)

**目的:** 開発環境の運用コスト削減と、本番環境を見据えたモダンなサーバーレス構成への移行。

**主な作業内容:**
- ✅ **バックエンドのLambda対応**:
    - Expressアプリケーションを`@vendia/serverless-express`でラップし、Lambda関数として実行可能に。
    - `lambda.ts`ハンドラを新規作成。
- ✅ **インフラのコード化 (CloudFormation)**:
    - API Gateway (HTTP API), Lambda関数, IAMロールを定義する`backend-lambda-stack.yaml`を新規作成。
    - LambdaからRDSへのアクセスを許可するため`vpc-stack.yaml`を更新し、`LambdaSecurityGroup`を追加。
- ✅ **デプロイパッケージの最適化**:
    - Lambdaのサイズ制限(250MB)をクリアするため、依存関係をLambdaレイヤーとして分離。
    - `build-for-lambda.sh`スクリプトを新規作成。
    - スクリプト内で`npm install`と`node-prune`、Prisma Engineのバイナリ削減(`binaryTargets`)を組み合わせ、レイヤーサイズを最適化。
- ✅ **デプロイと動作確認**:
    - 作成したパッケージをS3にアップロードし、CloudFormationでデプロイ。
    - `curl`コマンドでAPI Gatewayのエンドポイントを叩き、正常な応答を確認。

---

## 5. 今後の開発計画

### 5.1. 新バックエンドへの完全移行

1.  [ ] **フロントエンドの接続先変更**:
    - フロントエンドのAPIリクエスト先を、旧App Runnerエンドポイントから、今回作成した新しいAPI Gatewayエンドポイント (`https://gyyhuclush.execute-api.ap-northeast-1.amazonaws.com/`) へ変更する。
2.  [ ] **E2Eテストの実施**:
    - 新しいアーキテクチャで、既存のE2Eテストがすべてパスすることを確認する。
3.  [ ] **旧インフラの廃止**:
    - 新構成での動作に問題がないことを確認後、コスト削減のため旧App Runnerの関連リソース（`apprunner-stack.yaml`）をAWS上から削除する。

### 5.2. バックログタスク

- [ ] **CI/CDの構築**: `main`ブランチへのマージ時に自動デプロイするGitHub Actionsを構築する。
- [ ] **画像アップロード機能のインフラ構築**: 本番環境用の画像アップロード基盤を構築する。
- [ ] **UI/UXの全体的改善**: 保留中のUI/UX改善タスク（ヘッダー/フッター導入、デザイン精緻化、レスポンシブ対応）に着手する。

---

## 6. デプロイ状況 (2025/11/08時点)

### 6.1. フロントエンド (開発環境)

- ✅ **DNS**: `https://dev.gather-quiz.june-yamamoto.com`
- ✅ **インフラ**: S3 + CloudFront (`gather-quiz-frontend-dev`)

### 6.2. バックエンド (新構成: Lambda)

- ✅ **ステータス**: **稼働中**
- ✅ **エンドポイント**: `https://gyyhuclush.execute-api.ap-northeast-1.amazonaws.com/`
- ✅ **インフラ**: API Gateway + Lambda (`gather-quiz-backend-lambda-dev`)

### 6.3. バックエンド (旧構成: App Runner)

- ⚠️ **ステータス**: **廃止予定**
- ✅ **インフラ**: App Runner (`gather-quiz-apprunner-dev`)

### 6.4. 共通インフラ

- ✅ **ネットワーク**: VPC, サブネット, セキュリティグループ (`gather-quiz-vpc-dev`)
- ✅ **データベース**: RDS PostgreSQL (`gather-quiz-rds-dev`)
    - インスタンスタイプはコスト最適化のため`db.t4g.micro`に更新済み。
- ✅ **成果物格納場所**: S3 (`gather-quiz-lambda-artifacts-251108`)