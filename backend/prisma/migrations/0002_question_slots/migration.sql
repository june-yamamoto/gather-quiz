-- 問題枠のラベル・出題形式・選択肢を追加する（PostgreSQL / SQLite共通）。
-- 旧行はラベルなし・通常問題・選択肢なしとして保持する。
-- 運用Lambdaのmigrateが既存スキーマを確認し、トランザクション内で一度だけ適用する。
ALTER TABLE "Tournament" ADD COLUMN "questionSlots" TEXT;
ALTER TABLE "Quiz" ADD COLUMN "label" TEXT;
ALTER TABLE "Quiz" ADD COLUMN "choiceCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Quiz" ADD COLUMN "choices" TEXT NOT NULL DEFAULT '[]';
