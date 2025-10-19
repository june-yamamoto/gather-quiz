import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import quizzesRouter from "./quizzes";
import { PrismaClient, Tournament, Participant, Quiz } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use("/quizzes", quizzesRouter);

describe("クイズAPI", () => {
  let tournament: Tournament;
  let participant: Participant;
  let quiz: Quiz;

  beforeEach(async () => {
    tournament = await prisma.tournament.create({
      data: {
        name: "Quiz API Test Tournament",
        password: "password",
        questionsPerParticipant: 1,
        points: "10",
      },
    });
    participant = await prisma.participant.create({
      data: {
        name: "Quiz API Test Participant",
        password: "pw",
        tournamentId: tournament.id,
      },
    });
    quiz = await prisma.quiz.create({
      data: {
        point: 10,
        questionText: "Original Question",
        answerText: "Original Answer",
        tournamentId: tournament.id,
        participantId: participant.id,
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

  describe("POST / (クイズ作成)", () => {
    it("新しいクイズが正しく作成されること", async () => {
      const quizData = {
        point: 10,
        questionText: "テスト問題文",
        answerText: "テスト解答文",
        tournamentId: tournament.id,
        participantId: participant.id,
      };

      const res = await request(app).post("/quizzes").send(quizData);

      expect(res.statusCode).toBe(201);
      expect(res.body.questionText).toBe(quizData.questionText);
    });
  });

  describe("GET /:id (クイズ取得)", () => {
    it("指定したIDのクイズが正しく取得されること", async () => {
      const res = await request(app).get(`/quizzes/${quiz.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(quiz.id);
      expect(res.body.questionText).toBe("Original Question");
    });

    it("存在しないIDの場合、404エラーを返すこと", async () => {
      const res = await request(app).get("/quizzes/nonexistent_id");

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Quiz not found");
    });
  });

  describe("PUT /:id (クイズ更新)", () => {
    it("クイズ情報が正しく更新されること", async () => {
      const updatedData = {
        point: 20,
        questionText: "Updated Question",
        answerText: "Updated Answer",
      };
      const res = await request(app).put(`/quizzes/${quiz.id}`).send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(quiz.id);
      expect(res.body.point).toBe(updatedData.point);
      expect(res.body.questionText).toBe(updatedData.questionText);
    });

    it("存在しないIDの場合、404エラーを返すこと", async () => {
      const updatedData = {
        point: 20,
        questionText: "Updated Question",
      };
      const res = await request(app).put("/quizzes/nonexistent_id").send(updatedData);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Quiz not found");
    });

    it("必須フィールドが不足している場合でも更新できること (部分更新)", async () => {
      const partialUpdateData = {
        questionText: "Partially Updated Question",
      };
      const res = await request(app).put(`/quizzes/${quiz.id}`).send(partialUpdateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(quiz.id);
      expect(res.body.questionText).toBe(partialUpdateData.questionText);
      // 他のフィールドは変更されていないことを確認
      expect(res.body.point).toBe(quiz.point);
      expect(res.body.answerText).toBe(quiz.answerText);
    });
  });
});
