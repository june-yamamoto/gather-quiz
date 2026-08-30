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
- 本番/Lambdaでは `DATABASE_URL` または `SECRET_ID` を使用する。画像アップロードには `IMAGE_UPLOAD_BUCKET_NAME`、任意で `AWS_REGION` を使用する。
- DB push、マイグレーション、AWS Secrets Manager/RDSへの接続は明示的な依頼なしに実行しない。

## テスト時の注意

`npm run test` のpre/post scriptは `prisma/schema.prisma` を退避し、テスト用スキーマへ差し替える。Unixコマンドを使うためDev ContainerまたはWSLで実行する。失敗・中断時には次を確認する。

- `prisma/schema.prisma` が通常版へ戻っている
- `prisma/schema.original.prisma` が残っていない
- 意図しない `test.db` が追跡対象になっていない

同じスキーマを差し替えるバックエンド単体テストとPlaywright E2Eを並列実行しない。

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
