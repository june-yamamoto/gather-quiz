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

### 開発関連スクリプト

プロジェクトルートの `package.json` に定義されている、主要な開発スクリプトです。

- **`pnpm storybook`**: フロントエンドの Storybook を起動します。コンポーネントの単体開発やデザイン確認に利用します。
- **`pnpm lint-fix`**: 全てのワークスペース（`frontend`, `backend`）のコードに対して ESLint を実行し、修正可能な問題を自動修正します。
- **`pnpm format`**: 全てのワークスペースのコードに対して Prettier を実行し、コードを自動整形します。
- **`pnpm test`**: 全てのワークスペースの単体テスト（Vitest）を実行します。
- **`pnpm test:e2e`**: 全ての E2E テスト（Playwright）を実行します。
- **`pnpm dev:backend`**: バックエンドの開発サーバーを起動します。
- **`pnpm dev:frontend`**: フロントエンドの開発サーバーを起動します。
- **`pnpm db:push`**: バックエンドの Prisma スキーマをデータベースに適用します。

### テストの実行

#### E2E (End-to-End) テスト

Playwright を使用した E2E テストを実行します。

```bash
npx playwright test
```

現在、以下の主要なユーザーフローがテストされています。

- 大会作成フロー
- 参加者登録から問題作成ページへの遷移フロー
- 参加者ダッシュボードでの問題作成状況表示フロー

このコマンドは、`playwright.config.ts`の設定に基づき、自動で Web サーバーを起動してテストを実行します。

### 静的解析とフォーマット

コードの品質を保つため、ESLint と Prettier を導入しています。

```bash

# すべてのパッケージを対象に、修正可能な問題を自動修正

pnpm lint-fix



# すべてのパッケージを対象に、コードを自動整形

pnpm format

```

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
