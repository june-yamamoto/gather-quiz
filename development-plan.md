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

## 4. 次期開発計画

開発環境のデプロイが完了したため、次のフェーズとして本番環境の構築と運用改善に着手する。

### 4.1. CI/CDの構築

- [ ] **デプロイワークフローの作成**: `main`ブランチにマージされた際に、フロントエンドとバックエンドを自動で本番環境へデプロイするGitHub Actionsを構築する。

### 4.2. 本番環境のインフラ構成見直し

- [ ] **低コスト構成への移行**:
    - [ ] 現在のApp Runnerベースの構成から、よりコスト効率の高いサーバーレスアーキテクチャへの移行を検討・実装する。
    - [ ] 検討アーキテクチャ案: CloudFront + API Gateway + Lambda + DynamoDB (またはRDS)

### 4.3. 機能追加に伴うインフラ構築

- [ ] **画像アップロード機能のインフラ対応**: 開発環境で実装済みの画像アップロード機能（S3署名付きURL方式）について、本番環境用のインフラ（S3バケット、IAMポリシー等）をCloudFormationで定義・構築する。

---
*保留中のタスク：UI/UXの全体的改善（ヘッダー/フッター導入、デザイン精緻化、レスポンシブ対応）*

---

## 5. デプロイ計画 (進行中)

AWS CloudFormationを用いたデプロイを進行中。

### 5.1. フロントエンド (開発環境)

- ✅ **ACM証明書**: `dev.gather-quiz.june-yamamoto.com` の証明書発行と検証が完了。
- ✅ **インフラ構築**: `frontend-stack.yaml` を使用してS3 + CloudFrontの環境を `us-east-1` リージョンにデプロイ済み (`gather-quiz-frontend-dev`)。
- ✅ **ベーシック認証**: CloudFront Functionsを使い、サイト全体にベーシック認証を設定済み。
- ✅ **コンテンツデプロイ**: フロントエンドのビルド成果物をS3にアップロードし、CloudFrontのキャッシュを無効化済み。
- ✅ **DNS設定**: Route 53でCNAMEレコードを設定し、`https://dev.gather-quiz.june-yamamoto.com` でアクセス可能。

### 5.2. バックエンド (開発環境)

- ✅ **ネットワークインフラ**: `vpc-stack.yaml` を使用して、`ap-northeast-1` リージョンにVPC、サブネット、セキュリティグループ等を作成済み (`gather-quiz-vpc-dev`)。
- ✅ **コンテナリポジトリ**: ECRリポジトリを作成済み (`gather-quiz-backend-dev-ecr`)。
- ✅ **コンテナイメージ**: pnpmワークスペース環境におけるビルドの問題を解決したDockerfileを `packages/backend` に配置。修正したイメージをECRにプッシュ済み。
- ✅ **データベース**: 認証情報をリセットするため、`rds-stack.yaml` を使用してRDSインスタンスを再作成済み (`gather-quiz-rds-dev`)。
- ✅ **アプリケーションデプロイ**: `apprunner-stack.yaml` を使用して、App Runnerサービスを正常にデプロイ済み (`gather-quiz-apprunner-dev`)。

### 5.3. 本番環境

- **ACM証明書 (`gather-quiz.june-yamamoto.com`)**:
    - ✅ `us-east-1` リージョンで証明書をリクエストし、検証完了済み。
- **インフラ構成**:
    - **フロントエンド**: Amazon S3 + Amazon CloudFront
    - **バックエンド**: AWS App Runner
    - **データベース**: Amazon RDS (PostgreSQL)
- **DNS管理**:
    - ドメイン全体の管理をRoute 53へ移管済み。