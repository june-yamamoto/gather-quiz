# GatherQuiz

みんなで問題を持ち寄って、クイズ大会をもっと手軽に、もっと楽しく！

このアプリケーションは、友人や同僚、家族などが集まるオフラインの場で、手軽にクイズ大会を開催するための支援ツールです。参加者全員が問題作成者になることで、誰の問題が出るか分からないワクワク感を演出し、会を盛り上げることを目的とします。

## 開発

### 開発環境の起動（推奨：Dev Container）

1. [Visual Studio Code](https://code.visualstudio.com/) と [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) をインストールします。
2. このリポジトリを VS Code で開きます。
3. 左下の緑色のアイコンをクリックし、「Reopen in Container」を選択します。

コンテナのビルドと起動が完了すると、開発に必要なツールがすべてインストールされた状態でターミナルが利用可能になります。

### 開発サーバーの起動

1. **データベースのセットアップ** (初回のみ)

   ```bash
   pnpm db:push
   ```

2. **開発サーバーの起動**

   - バックエンドを起動する:

     ```bash
     pnpm dev:backend
     ```

   - (別のターミナルで) フロントエンドを起動する:
     ```bash
     pnpm dev:frontend
     ```

フロントエンドは `http://localhost:5173` で、バックエンドは `http://localhost:3000` で起動します。

### 主なnpmスクリプト

プロジェクトのルートディレクトリで実行できる、主要なnpmスクリプトです。

#### サーバー起動

| コマンド | 説明 |
| :--- | :--- |
| `pnpm dev:frontend` | フロントエンドの開発サーバーを起動します ( `http://localhost:5173` )。 |
| `pnpm dev:backend` | バックエンドの開発サーバーを起動します ( `http://localhost:3000` )。 |

#### テスト

ローカルでの開発中は、ファイルの変更を検知して自動でテストを実行する**ウォッチモード**が便利です。CI（継続的インテグレーション）環境では、一度だけテストを実行するシングル実行モードのコマンドが使用されます。

| コマンド | 説明 |
| :--- | :--- |
| `pnpm test:frontend:watch` | **【ローカル開発用】** フロントエンドの単体テストをウォッチモードで実行します。 |
| `pnpm test:backend:watch` | **【ローカル開発用】** バックエンドの単体テストをウォッチモードで実行します。 |
| `pnpm test:frontend` | **【CI用】** フロントエンドの単体テストを一度だけ実行します。 |
| `pnpm test:backend` | **【CI用】** バックエンドの単体テストを一度だけ実行します。 |
| `pnpm test:e2e` | PlaywrightによるE2Eテストを実行します。 |

#### コード品質

| コマンド | 説明 |
| :--- | :--- |
| `pnpm lint` | プロジェクト全体のコードを検証します（コードの修正は行いません）。 |
| `pnpm lint-fix` | プロジェクト全体のコードを検証し、修正可能な問題を自動で修正します。 |
| `pnpm format` | プロジェクト全体のコードをPrettierで自動整形します。 |

#### その他

| コマンド | 説明 |
| :--- | :--- |
| `pnpm db:push` | Prismaスキーマをデータベースに適用します。 |
| `pnpm storybook` | フロントエンドのStorybookを起動します。 |


---

### ローカルでの実行（非推奨）

1. **依存関係のインストール**

   ```bash
   pnpm install
   ```

2. **データベースのセットアップ**

   ```bash
   pnpm db:push
   ```

3. **開発サーバーの起動**

   - バックエンド

     ```bash
     pnpm dev:backend
     ```

   - フロントエンド
     ```bash
     pnpm dev:frontend
     ```
