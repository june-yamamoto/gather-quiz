# 問題枠・選択肢の追加マイグレーション

実行用ファイル: [migration.sql](migration.sql)

| テーブル | 列 | 既存行の値 |
| --- | --- | --- |
| Tournament | questionSlots（TEXT、JSON配列） | NULL（従来の配点から通常問題を復元） |
| Quiz | label（TEXT） | NULL |
| Quiz | choiceCount（INTEGER） | 0（通常問題） |
| Quiz | choices（TEXT、JSON配列） | `[]` |

初期スキーマの適用済みDBが対象。PostgreSQLとSQLiteの両方で使用する。既存の大会・参加者・問題・画像・リンクは変更しない。

本番は既存の運用Lambdaの明示的な `migrate` 操作で適用する。Lambdaは初期スキーマハッシュを照合し、追加SQLとハッシュ更新を同じトランザクションで実行する。適用済みなら再実行しない。SQL単体は重複適用しないこと。

新規DBは `prisma/schema.current.sql` を利用する。既存DBの初期SQLを差し替えて再初期化しない。実環境への適用は別途実施する。

検証: `npm run test --prefix backend` の `question-slots-migration.test.ts` で既存行保持と初期値を確認する。
