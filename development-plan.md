# GatherQuiz 開発計画書

## 1. 開発の概要

ドキュメントに基づき、本アプリケーション「GatherQuiz」を以下の技術スタックと方針で開発する。

- **モノリポ構成**: フロントエンド、バックエンド、データベース関連のプロジェクトを一つのリポジトリ内で個別のディレクトリとして管理する。
- **技術スタック**:
    - **フロントエンド**: React (TypeScript) + Vite
        - UIフレームワーク: Material-UI (MUI) with Emotion `styled` API
        - ルーティング: React Router
    - **バックエンド**: Node.js (TypeScript) + Express
        - データベース: SQLite (開発時), PostgreSQL (本番想定)
        - ORM: Prisma
    - **パッケージ管理**: pnpm (ワークスペース機能を利用)

---

## 2. 現在の進捗

- **フェーズ1: プロジェクト基盤の構築**: ✅ 完了
- **フェーズ2: 主要機能の実装**: ✅ 完了
- **フェーズ3: 大会実施機能と仕上げ**: ✅ 完了

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

---

## 4. 継続的改善タスク

- **E2Eテストの導入 (完了)**
    - ✅ Playwrightの導入とDev Container上での動作環境を構築。
    - ✅ すべての主要ユーザーフローに対するE2Eテストを実装し、動作検証を完了。
- **CI/CDの構築 (Next Step)**
    - GitHub Actionsを導入し、以下のワークフローを構築する。
        - 静的解析 (Lint)
        - 単体テスト (Unit Test)
        - E2Eテスト
- **リファクタリング (Next Step)**
    - DBスキーマの正規化（`Quiz`モデルの選択肢など）
    - コンポーネントの分割と可読性向上

## リファクタリング指示

- サーバー
  - DBで使用するモデルをクラス化して`backend/src/model`に切り出してください
- フロントエンド
  - サーバと通信するfetch処理は対象となるモデル毎のクラスに切り出してください
  - StyledComponent化したコンポーネントは必ず全てPrefixに`Styled`をつけてください

---

## 6. GEMINI.md 規約適合タスク

`GEMINI.md`に記載された新しい規約にコードベースを適合させるためのタスク一覧。

- **重複ロジックの関数化**
  - **バックエンド**: 各APIルートで共通しているエラーハンドリングのロジックを、共通のエラーハンドリングミドルウェアとして切り出すことを検討する。
  - **フロントエンド**: 各ページコンポーネントの`useEffect`内で共通しているAPI呼び出しの`try-catch`ロジックを、汎用的なカスタムフック（例: `useApi`）として切り出すことを検討する。

- **フロントエンドルーティングパスの関数化**
  - `packages/frontend/src/utils/paths.ts`のようなヘルパーファイルを作成し、`react-router-dom`で使用する全てのパスを生成する関数を実装する。

- **フロントエンドモデルのクラス化**
  - `packages/frontend/src/models`ディレクトリに`Tournament.ts`と`Participant.ts`を追加する。
  - `Quiz.ts`を含む全てのモデルクラスに、APIレスポンスをクラスインスタンスに変換する`fromApi`静的メソッドと、APIリクエスト用にオブジェクトを変換する`toApi`メソッドを実装する。

- **Styled-Componentsの命名規則適用**
  - `Styled`プレフィックスが付与されていないStyled-Component（例: `Form`, `Section`）を、規約通り`StyledForm`, `StyledSection`などにリネームする。
    - 対象ファイル例: `packages/frontend/src/pages/TournamentCreationPage.tsx`, `packages/frontend/src/pages/QuizCreatorPage.tsx` など。

---

## 5. デプロイ計画 (中断中)

AWS CloudFormationを用いたデプロイを計画中。ドメイン移管作業の完了待ち。

- **インフラ構成**:
    - **フロントエンド**: Amazon S3 + Amazon CloudFront
    - **バックエンド**: AWS App Runner
    - **データベース**: Amazon RDS (PostgreSQL)
- **DNS管理**:
    - ドメイン全体の管理をRoute 53へ移管する方式で進行中。