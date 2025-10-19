import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import tournamentsRouter from "./tournaments";
import { PrismaClient, Tournament } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use("/tournaments", tournamentsRouter);

describe("大会API", () => {
  let tournament: Tournament;

  beforeEach(async () => {
    tournament = await prisma.tournament.create({
      data: {
        name: "APIテスト用大会",
        password: "correct-password",
        questionsPerParticipant: 3,
        points: "10,20,30",
      },
    });
  });

  afterEach(async () => {
    await prisma.quiz.deleteMany({ where: { tournamentId: tournament.id } });
    await prisma.participant.deleteMany({
      where: { tournamentId: tournament.id },
    });
    await prisma.tournament.deleteMany({ where: { id: tournament.id } });
  });

  describe("POST /:id/login (主催者ログイン)", () => {
    it("正しいパスワードでログインが成功すること", async () => {
      const res = await request(app)
        .post(`/tournaments/${tournament.id}/login`)
        .send({ password: "correct-password" });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("間違ったパスワードでログインが失敗すること", async () => {
      const res = await request(app)
        .post(`/tournaments/${tournament.id}/login`)
        .send({ password: "wrong-password" });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /:id/status (大会ステータス取得)", () => {
    it("参加者の問題作成状況を含んだ大会ステータスが返されること", async () => {
      const participant = await prisma.participant.create({
        data: {
          name: "テスト参加者",
          password: "pw",
          tournamentId: tournament.id,
        },
      });
      await prisma.quiz.create({
        data: {
          point: 10,
          questionText: "テスト問題",
          answerText: "テスト解答",
          tournamentId: tournament.id,
          participantId: participant.id,
        },
      });

      const res = await request(app).get(
        `/tournaments/${tournament.id}/status`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.tournamentName).toBe("APIテスト用大会");
      expect(res.body.participants).toHaveLength(1);
      expect(res.body.participants[0].name).toBe("テスト参加者");
      expect(res.body.participants[0].created).toBe(1);
      expect(res.body.participants[0].required).toBe(3);
    });
  });
});
