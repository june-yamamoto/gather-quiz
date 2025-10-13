# GatherQuiz

みんなで問題を持ち寄って、クイズ大会をもっと手軽に、もっと楽しく！

このアプリケーションは、友人や同僚、家族などが集まるオフラインの場で、手軽にクイズ大会を開催するための支援ツールです。参加者全員が問題作成者になることで、誰の問題が出るか分からないワクワク感を演出し、会を盛り上げることを目的とします。

## 開発

### 開発環境の起動（推奨：Dev Container）

1. [Visual Studio Code](https://code.visualstudio.com/) と [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) をインストールします。
2. このリポジトリをVS Codeで開きます。
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

フロントエンドは `http://localhost:5173` で、バックエンドは `http://localhost:3000` で起動します。\n\n### テストの実行\n\n#### E2E (End-to-End) テスト\n\nPlaywrightを使用したE2Eテストを実行します。\n\n```bash\nnpx playwright test\n```\n\nこのコマンドは、`playwright.config.ts`の設定に基づき、自動でWebサーバーを起動してテストを実行します。

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
