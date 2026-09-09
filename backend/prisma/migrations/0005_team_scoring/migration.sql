-- 作問者・既存の問題データを変更せず、採点状態を追加する。
ALTER TABLE "Tournament" ADD COLUMN "teams" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Quiz" ADD COLUMN "answerRevealed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Quiz" ADD COLUMN "judgments" TEXT NOT NULL DEFAULT '{}';
