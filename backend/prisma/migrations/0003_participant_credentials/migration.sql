-- 既存参加者はloginId=NULLのまま従来の表示名でログインする。
ALTER TABLE "Participant" ADD COLUMN "loginId" TEXT;
ALTER TABLE "Participant" ADD COLUMN "loginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Participant" ADD COLUMN "loginWindowStart" TIMESTAMP(3);
DROP INDEX "Participant_tournamentId_name_key";
CREATE UNIQUE INDEX "Participant_tournamentId_loginId_key" ON "Participant"("tournamentId", "loginId");
-- パスワードは運用Lambdaが同一トランザクション内でソルト付きscryptへ変換する。
