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
- **フェーズ5: 機能改修と仕上げ**: ✅ 完了

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

**現状:**
- **dev環境の完全復旧**: バックエンド（Lambda）、データベース（RDS）、フロントエンド（S3+CloudFront）の全てのスタックが正常にデプロイされ、稼働しています。
- **Prisma 7への移行**: 最新のPrisma 7を導入し、設定ファイルベースの管理に移行しました。

**主な作業内容:**
- ✅ **パッケージ分離とnpm移行**: `packages/backend`, `packages/frontend` をルート直下に移動し、pnpm から npm へ移行。
- ✅ **Backend Lambda対応**: `Dockerfile`, `lambda.ts` を修正し、Lambda環境での動作を確立。
- ✅ **SSL接続問題の解消**: パブリックアクセスのRDSに対するSSL接続エラー（自己署名証明書問題）を、`db.ts` の `pg` プール設定 (`rejectUnauthorized: false`) で解消。
- ✅ **Prisma 7アップグレード**:
    - `prisma.config.ts` を導入し、DB接続設定を集約。
    - `schema.prisma` から `url` プロパティを削除し、環境変数ベースに移行。
    - 不要なスキーマファイルを削除し整理。
- ✅ **データベースマイグレーション**: RDSに対して `prisma db push` を実行し、テーブルを作成完了。
- ✅ **フロントエンドデプロイ**:
    - S3バケットとCloudFrontディストリビューション (`gather-quiz-dev-v4`) をデプロイ。
    - 古いCloudFrontとのCNAME競合を解消し、Route 53のDNSレコードを更新。
    - CloudFront -> API Gateway -> Lambda -> RDS の疎通確認完了（200 OK）。

---

## 5. 今後の開発計画

### 5.1. 新バックエンドへの完全移行 (完了)

1.  ✅ **インフラ再構築**:
    - `gather-quiz-vpc-dev`, `gather-quiz-rds-dev`, `gather-quiz-backend-lambda-dev`, `gather-quiz-frontend-dev-v2` スタックの再デプロイ完了。
2.  ✅ **動作確認**:
    - Lambda関数が正常に起動し、RDSへの接続（SSLエラー解消、テーブル作成済み）を確認。
    - フロントエンドからAPIへの接続（CORS、パスルーティング）を確認。
3.  [ ] **E2Eテストの実施**:
    - 新しいアーキテクチャで、既存のE2Eテストがすべてパスすることを確認する。

### 5.2. バックログタスク

- [ ] **CI/CDの構築**: `main`ブランチへのマージ時に自動デプロイするGitHub Actionsを構築する。
- [ ] **画像アップロード機能のインフラ構築**: 本番環境用の画像アップロード基盤を構築する。
- [ ] **UI/UXの全体的改善**: 保留中のUI/UX改善タスク（ヘッダー/フッター導入、デザイン精緻化、レスポンシブ対応）に着手する。
- **機能の改修 (完了)**
  - ✅ クイズ大会の参加者の名前は重複できないようにする
  - ✅ クイズ大会名は重複可能
  - ✅ 一人あたりの問題数を設定するフォームに数値を記入すると、問題ごとの配点を記入するフォームが設定した問題数分表示される
    - 参加者が作成する問題はそれぞれ区別される
  - ✅ 問題作成前に、作成する問題の配点を選択する。該当の配点に対応する問題を作成する形とする
    - 問題作成時に配点の設定は行わない
  - ✅ 問題作成時、問題文または問題の添付画像の記入を必須とする
  - ✅ 問題作成時、解答文または解答の添付画像の記入を必須とする
  - ✅ 参加者ダッシュボードから、問題編集ができるようにする
  - ✅ 参加者ダッシュボードに、参加者名を表示する
  - ✅ 1回以上大会開始ボタンが押された大会は、開始済マークが表示される
  - ✅ 問題ボード画面にて、一度以上開かれた問題は既読マークが表示される
  - ✅ 問題ボード画面にて、紐づく問題が一問も既読状態になっていない参加者は参加者名が表示されない
  - ✅ 大会ポータル画面から、既に登録されている参加者があとから参加者ダッシュボードに入り、編集開始を行うための口を作る
  - ✅ あとから参加者ダッシュボードに入るときは、自動生成されたパスワードの入力をもって確認する
  - ✅ 参加者登録した際に、自動生成されたパスワードを表示して参加者に教えて下さい
  - ✅ 主催者ダッシュボードでの大会ステータスバッジの表示 (完了)

### 5.3. 詳細な改修計画 (2025/11/30更新 -> 2025/12/01 完了)

#### 1. データモデルの変更 (完了)
- **ファイル**: `backend/prisma/schema.prisma`
  - ✅ **`Quiz` モデルへのカラム追加**:
    - `order` (Int, default: 0): 「第何問目の問題か」を識別するため。同じ配点の問題が複数ある場合に区別する。
    - `isOpened` (Boolean, default: false): 問題ボードで既読状態を管理するため。

#### 2. バックエンド改修 (完了)
- **ファイル**: `backend/src/routes/quizzes.ts`
  - ✅ **API: `POST /` (問題作成)**:
    - リクエストボディで `order` (順序) を受け取り、DBに保存するように修正。
    - **バリデーション追加**:
      - `questionText` または `questionImage` のどちらかが必須。
      - `answerText` または `answerImage` のどちらかが必須。
      - 不足している場合は `400 Bad Request` を返す。
  - ✅ **API: `GET /:id` (問題詳細)**:
    - 問題データ取得時に、`isOpened` フラグを `true` に更新する処理を追加。
- **ファイル**: `backend/src/routes/tournaments.ts`
  - ✅ **API: `GET /:id/board` (ボード取得)**:
    - レスポンスの `Quiz` オブジェクトに `order`, `isOpened` を含める（Prismaのデフォルト動作で含まれるはずだが確認）。
  - ✅ **API: `POST /:id/participants/login` (参加者ログイン)**:
    - 参加者が名前とパスワードでログインし、ダッシュボードへアクセスするためのエンドポイントを追加。

#### 3. フロントエンド改修 (完了)
- **参加者登録 (`frontend/src/pages/ParticipantRegistrationPage.tsx`)**
  - ✅ 名前重複エラー（バックエンドからの409/500エラー）をキャッチし、「その名前は既に使用されています」といった具体的なエラーメッセージを表示する。
  - ✅ 登録完了時に自動生成されたパスワードを表示し、ユーザーに控えるよう促す画面を追加。

- **大会作成フォーム (`frontend/src/components/TournamentForm.tsx`)**
  - ✅ **UI変更**: 現在のカンマ区切りテキスト入力 (`points`) を廃止。
  - ✅ **ロジック変更**:
    - `questionsPerParticipant` (問題数) の入力値に応じて、数値入力欄（「1問目の配点」「2問目の配点」...）を動的に生成・表示する。
    - フォーム送信時に、各入力欄の値を結合してカンマ区切り文字列 (`10,20,30`) に変換し、APIに送信する。

- **参加者ダッシュボード (`frontend/src/pages/ParticipantDashboardPage.tsx`)**
  - ✅ **表示追加**: 画面上部に参加者名を表示する。
  - ✅ **問題リストの刷新**:
    - 大会の設定配点 (`points`) を配列に展開し、順序ごとにリスト表示する。
    - **未作成の場合**: 「作成する」ボタンを表示。クリックで `QuizCreatorPage` へ遷移（`order` と `point` を渡す）。
    - **作成済みの場合**: 「編集する」ボタンを表示。クリックで `QuizCreatorPage` へ遷移（編集モード）。

- **問題作成・編集 (`frontend/src/pages/QuizCreatorPage.tsx`)**
  - ✅ **初期表示**: URLパラメータやStateから `order` と `point` を受け取る。配点欄は編集不可（Read-only）に変更する。
  - ✅ **バリデーション**: `handleSubmit` 内で、問題（テキストor画像）と解答（テキストor画像）の必須入力をチェックし、不足があれば送信を中断してエラー表示する。

- **問題ボード (`frontend/src/pages/QuizBoardPage.tsx`)**
  - ✅ **既読表示**: `QuizCard` コンポーネントを改修し、`isOpened` が `true` の場合に既読スタイル（グレーアウトや「済」マーク）を適用する。
  - ✅ **参加者名の非表示**: 各参加者の持つクイズリストをチェックし、全てのクイズが未読 (`isOpened === false`) の場合、参加者名を「???」等の表示にするか、非表示にする。

- **主催者ダッシュボード (`frontend/src/pages/OrganizerDashboardPage.tsx`)**
  - ✅ 大会ステータス (`tournament.status`) を確認し、`in_progress` または `finished` の場合に「開始済み」バッジを表示する。

- **大会ポータル (`frontend/src/pages/TournamentPortalPage.tsx`)**
  - ✅ 参加者ログイン用のダイアログを追加し、既存参加者がダッシュボードにアクセスできるように改修。


---

## 6. デプロイ状況 (2025/12/02更新)

### 6.1. フロントエンド (開発環境)

- ✅ **ステータス**: **稼働中**
- **URL**: `https://dev.gather-quiz.june-yamamoto.com`
- **インフラ**: S3 (`gather-quiz-dev-v4-frontend-bucket`) + CloudFront (`gather-quiz-frontend-dev-v2`)

### 6.2. バックエンド (新構成: Lambda)

- ✅ **ステータス**: **稼働中**
- **API Endpoint**: `https://38e2eh40bg.execute-api.ap-northeast-1.amazonaws.com` (CloudFront経由で利用)
- **インフラ**: API Gateway + Lambda (`gather-quiz-backend-lambda-dev`)

### 6.3. バックエンド (旧構成: App Runner)

- ⛔ **ステータス**: **廃止** (スタック削除済み)

### 6.4. 共通インフラ

- ✅ **ステータス**: **稼働中**
- **ネットワーク**: VPC (`gather-quiz-vpc-dev`)
- **データベース**: RDS PostgreSQL (`gather-quiz-rds-dev`)
- **成果物格納場所**: S3 (`gather-quiz-lambda-artifacts-251108`)