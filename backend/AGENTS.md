# バックエンド Codex ガイド

このファイルは `backend/` 配下に適用し、ルートの `AGENTS.md` を補足する。

## 構成

- `src/index.ts`: Expressアプリ、middleware、routerの組み立て。通常サーバーの入口
- `src/lambda.ts`: API Gateway/Lambdaハンドラー
- `src/routes/`: 大会、参加者、クイズ、画像アップロードのAPI
- `src/api-helper.ts`: `/api` のパス生成と `asyncHandler`
- `src/model/`: Prisma結果を公開JSONへ変換するドメインモデル
- `src/db.ts`: 実行環境別のPrisma初期化
- `src/middleware/errorHandler.ts`: HTTPエラーの共通変換
- `prisma/`: SQLite、PostgreSQL、単体テスト、E2E用スキーマ
- `test/`: Vitest/Supertestのrouteテスト

## API実装規約

- 新しいパスはまず `src/api-helper.ts` に生成関数を定義し、router側ではmount先を考慮した相対パスへ変換する。
- 非同期route handlerは `asyncHandler` で包み、既知の失敗は `src/errors/HttpErrors.ts` の型を使う。
- `errorHandler` は全routerの後に置く。個別routeで同じエラーレスポンス処理を複製しない。
- 入力値を検証してからPrismaへ渡す。認証失敗と対象なしを既存のHTTPステータスへ合わせる。
- APIレスポンスは `src/model/` の `toJSON()` を通す現行パターンを優先する。
- routeを変更するときは対応するSupertestを先に更新し、成功・入力不正・対象なし・認証失敗のうち該当ケースを確認する。
- パスワードや接続文字列をログ・レスポンスへ出さない。現在の公開モデルにパスワードが含まれる箇所を拡大しない。

## データベース

- `prisma/schema.prisma`: SQLite向けの通常スキーマ
- `prisma/schema.test.prisma`: 単体テスト用SQLite
- `prisma/schema.e2e.prisma`: E2E用SQLite
- `prisma/schema.postgres.prisma`: AWS RDS PostgreSQL用
- スキーマ変更は4ファイルの差分を比較し、意図的なprovider差以外は同期する。
- 大会 `Tournament` は参加者とクイズを持ち、参加者名は大会内で一意。
- クイズは大会と作成参加者の両方に属する。配点、表示順、既読状態、任意の問題・解答テキスト/画像/リンクを持つ。
- 本番/Lambdaは `DB_HOST`、`DB_USER`、`DB_PASSWORD` を使用する。SSM標準SecureStringをデプロイ時に読み込み、実行時の秘密取得は行わない。RDS CA検証を有効にする。
- 画像には `IMAGE_UPLOAD_BUCKET_NAME` とCloudFrontの `IMAGE_PUBLIC_BASE_URL` を使用する。画像S3は非公開。
- `src/maintenance.ts` はIAM専用のDB運用Lambda。初期化・バックアップ・復元を担当し、公開APIへ接続しない。
- 適用済みの初期SQLは `prisma/migrations/0001_initial/migration.sql`。既存DBへの破壊的な自動同期は禁止する。
- DB push、マイグレーション、AWS SSM/RDSへの接続は明示的な依頼なしに実行しない。

## テスト時の注意

`npm run test` はルートの `scripts/backend-tests.ts` を実行する。スキーマを書き換えず、一時DBを使う。WindowsとCIで同じコマンドを使用する。失敗・中断時には次を確認する。

- ソースのスキーマに意図しない変更がない
- 生成Clientが通常のSQLite版へ復元されている
- `build/test-*.db` が残っていない

生成Clientを共有するバックエンド単体テスト・Playwright E2E・本番ZIP生成を同時実行しない。

## コマンド

ルートから実行する場合:

```bash
npm run test --prefix backend
npm run lint --prefix backend
npm run build --prefix backend
npm run dev:sqlite --prefix backend
npm run dev:postgres --prefix backend
```

`dev:postgres` と `db:push` は接続先を確認してから使う。単体テストではVitestのtest環境と `vitest.config.ts` のSQLite用 `DATABASE_URL` を前提に、`src/db.ts` がSQLite adapterを選択する構成を維持する。
