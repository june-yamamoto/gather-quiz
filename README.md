# GatherQuiz

みんなで問題を持ち寄って、クイズ大会をもっと手軽に、もっと楽しく！

このアプリケーションは、友人や同僚、家族などが集まるオフラインの場で、手軽にクイズ大会を開催するための支援ツールです。参加者全員が問題作成者になることで、誰の問題が出るか分からないワクワク感を演出し、会を盛り上げることを目的とします。

## 機能ハイライト

- **主催者**:
  - 大会作成・管理（参加者数、問題数、配点の動的設定）
  - 参加者招待（専用URL）
  - 大会進行管理（開始、ボード表示）
- **参加者**:
  - 参加登録（名前のみで簡単登録、パスワード自動生成）
  - **NEW!** 参加者ログイン機能（再入場が可能）
  - **NEW!** 参加者ダッシュボード（配点ごとの問題作成状況を一覧管理）
  - クイズ作成（画像アップロード対応、プレビュー機能）
- **大会当日**:
  - クイズボード表示（未読・既読の管理、未作成問題の表示、全問未読時は名前を伏せる機能）
  - 問題・解答の投影（全画面表示の没入モード）
  - **NEW!** 大会終了機能（全問終了時にポータルへ戻る導線）

## 技術スタック

- **フロントエンド**: React (TypeScript), Vite, Material-UI, TanStack Query
- **バックエンド**: Node.js (TypeScript), Express (Serverless), Prisma v7
- **データベース**: PostgreSQL (AWS RDS), SQLite (開発用)
- **インフラ**: AWS (Lambda, API Gateway, S3, CloudFront, RDS)

## 開発

### 開発環境の起動（推奨：Dev Container）

1. [Visual Studio Code](https://code.visualstudio.com/) と [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) をインストールします。
2. このリポジトリを VS Code で開きます。
3. 左下の緑色のアイコンをクリックし、「Reopen in Container」を選択します。

コンテナのビルドと起動が完了すると、開発に必要なツールがすべてインストールされた状態でターミナルが利用可能になります。

### 開発サーバーの起動

1. **データベースのセットアップ** (初回のみ)

   ```bash
   npm run db:push
   ```

2. **開発サーバーの起動**

   - バックエンドを起動する:

     ```bash
     npm run dev:backend
     ```

   - (別のターミナルで) フロントエンドを起動する:
     ```bash
     npm run dev:frontend
     ```

フロントエンドは `http://localhost:5173` で、バックエンドは `http://localhost:3000` で起動します。

### 主なnpmスクリプト

プロジェクトのルートディレクトリで実行できる、主要なnpmスクリプトです。

#### サーバー起動

| コマンド | 説明 |
| :--- | :--- |
| `npm run dev:frontend` | フロントエンドの開発サーバーを起動します ( `http://localhost:5173` )。 |
| `npm run dev:backend` | バックエンドの開発サーバーを起動します ( `http://localhost:3000` )。 |

#### テスト

| コマンド | 説明 |
| :--- | :--- |
| `npm run test:frontend` | フロントエンドの単体テストを一度だけ実行します。 |
| `npm run test:backend` | バックエンドの単体テストを一度だけ実行します。 |
| `npm run test` | 全体のテストを実行します。 |

#### コード品質

| コマンド | 説明 |
| :--- | :--- |
| `npm run lint` | プロジェクト全体のコードを検証します（コードの修正は行いません）。 |
| `npm run lint-fix` | プロジェクト全体のコードを検証し、修正可能な問題を自動で修正します。 |
| `npm run format` | プロジェクト全体のコードをPrettierで自動整形します。 |

#### その他

| コマンド | 説明 |
| :--- | :--- |
| `npm run db:push` | Prismaスキーマをデータベースに適用します。 |
| `npm run storybook` | フロントエンドのStorybookを起動します。 |
