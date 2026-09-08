# GatherQuiz

参加者が問題を持ち寄り、オフラインのクイズ大会を開催・進行するWebアプリです。

## 機能

- 主催者：大会作成・編集、参加者招待、進行管理
- 参加者：登録・再ログイン、配点ごとの問題作成、画像アップロード
- 大会当日：問題ボード、問題・解答の全画面表示、既読管理

## 現行構成

2026-09-08にAWS上へ再構築し、動作確認した構成です。

- 公開URL：https://dev.gather-quiz.june-yamamoto.com
- React 18 / TypeScript / Vite / MUI / TanStack Query
- Express 5 / Prisma 7 / Lambda ZIP（Node.js 24、ARM64）
- CloudFrontから静的S3・HTTP API・画像S3へ振り分け
- RDS PostgreSQL 17、db.t4g.micro、Single-AZ、20 GiB gp3
- DBは非公開。NAT Gateway、踏み台、ECR、Lambda Layerは使用しない
- DB秘密情報はSSM標準SecureString。デプロイ時にLambdaへ設定
- DB運用用Lambdaで初期化・バックアップ・リストア

構成・復旧手順は [インフラ運用](docs/インフラ運用.md)、実測結果は [デプロイ検証記録](docs/デプロイ検証記録.md) を参照してください。

## セットアップ

Node.js 24とnpmを使用します。Docker、WSL、PostgreSQLクライアントは不要です。

```bash
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

Windows上で既存のnpmキャッシュにOS別依存不足がある場合は、クリーンな環境で再インストールしてください。CIはUbuntu上のNode.js 24で実行します。

## ローカル開発

別々のターミナルで実行します。

```bash
npm run dev:backend
npm run dev:frontend
```

バックエンドはローカルSQLiteの `backend/dev.db` を初期化・使用し、再起動後も保持します。フロントエンドは http://localhost:5173、APIは http://localhost:3000/api です。APIクライアントの既定値は `/api`、画面ルートは `/gather` 配下です。

## 検証

```bash
npm run test --prefix backend
npm run lint --prefix backend
npm run build --prefix backend
npm run test --prefix frontend
npm run lint --prefix frontend
npm run build --prefix frontend
npm run test:infra
node backend/node_modules/typescript/bin/tsc -p scripts/tsconfig.json
npx playwright install chromium
npm run test:e2e
```

単体テスト・E2Eは一時SQLiteを使い、ソースのPrismaスキーマを差し替えません。生成Clientを共有するため、バックエンドテスト・E2E・ZIP生成は同時実行しないでください。

## デプロイ

AWS認証済みの環境で実行します。初回構築はRDSなどの作成待ちがあるため、通常更新と所要時間が異なります。

```bash
npm run deploy
npm run deploy:backend
npm run deploy:frontend
npm run smoke
```

`deploy` は全インフラ・DB初期化・アプリ公開を実施します。通常は変更した側だけを更新します。成果物を再利用する場合は `node --import tsx scripts/deploy.ts backend --skip-build` または `frontend --skip-build` を使います。

GitHub Actionsの **Deploy application** は手動起動です。main上でbackend / frontend / bothを指定でき、検証済みのビルドを再ビルドせず公開します。mainへのマージだけではAWSを更新しません。AWS認証はOIDCで、リポジトリ変数 `AWS_DEPLOY_ROLE_ARN` を使用します。

## DBバックアップとリストア

```bash
npm run db:backup
npm run db:verify -- backups/<バックアップ名>.json.gz
npm run db:restore -- backups/<バックアップ名>.json.gz --confirm=gather-quiz-dev
```

バックアップは非公開S3に保存します。verifyは隔離スキーマへ復元してチェックサムを検証し、業務データを変更しません。restoreは業務3テーブルを置き換えるため、事前バックアップと単一トランザクションを必須にしています。画像実体はDBバックアップに含まれません。

## 関連文書

- [要件定義](docs/要件定義.md)
- [画面遷移](docs/外部仕様/画面遷移.md)
- [開発計画](development-plan.md)
- [フロントエンド規約](frontend/AGENTS.md)
- [バックエンド規約](backend/AGENTS.md)
