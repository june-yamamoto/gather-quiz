-- 既存問題の正解文を保持し、正解選択肢は未設定で追加する。
ALTER TABLE "Quiz" ADD COLUMN "correctChoiceIndex" INTEGER;
