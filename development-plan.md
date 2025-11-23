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

## 4. サーバーレスアーキテクチャへの移行 (デバッグ中)

**目的:** 開発環境の運用コスト削減と、本番環境を見据えたモダンなサーバーレス構成への移行。

**現状:**
- Lambdaのデプロイ方式をコンテナイメージ形式に変更し、デプロイ自体には成功。
- しかし、APIを呼び出すと`500 Internal Server Error`が発生する問題が継続しており、現在原因を調査中。
- デバッグの一環として、`lint`および`test`コマンドをすべて実行し、コードベースの静的解析とユニットテストが正常に完了することは確認済み。

**主な作業内容:**
- ✅ **方針転換**: zip形式でのデプロイで発生したサイズ上限問題を解決するため、コンテナイメージ形式でのデプロイに方針を転換。
- ✅ **ECRリポジトリ作成**: Lambdaコンテナイメージ用のECRリポジトリ (`gather-quiz-lambda-ecr`) を作成。
- ✅ **DockerfileのLambda対応**: Lambdaコンテナイメージとして実行可能なDockerfileを実装。
- ✅ **CloudFormationの修正**: `backend-lambda-stack.yaml`をコンテナイメージ参照方式に修正。
- ✅ **Prisma Driver Adapter導入**: Prismaのクエリエンジンバイナリを不要にし、デプロイパッケージのサイズを削減するため、`@prisma/adapter-pg`を導入。
- ✅ **デプロイ**: 上記の修正を反映したコンテナイメージをビルドし、ECRにプッシュ後、CloudFormationスタックを正常にデプロイ完了。
- ⏳ **デバッグ**: デプロイされたLambda関数で発生する500エラーの原因をCloudWatch Logsを用いて調査中。

---

## 5. 今後の開発計画

### 5.1. 新バックエンドへの完全移行

1.  [ ] **バグ修正**: 現在発生している500エラーを解決し、バックエンドが正常に動作するように修正する。
2.  [ ] **フロントエンドの接続先変更**:
    - フロントエンドのAPIリクエスト先を、新しいAPI Gatewayエンドポイントへ変更する。
3.  [ ] **E2Eテストの実施**:
    - 新しいアーキテクチャで、既存のE2Eテストがすべてパスすることを確認する。
4.  [ ] **旧インフラの廃止**:
    - 新構成での動作に問題がないことを確認後、コスト削減のため旧App Runnerの関連リソースをAWS上から削除する。

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