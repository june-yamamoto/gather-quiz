import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import quizzesRouter from "./quizzes";
import { PrismaClient, Tournament, Participant } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use("/quizzes", quizzesRouter);

describe("クイズAPI", () => {
  let tournament: Tournament;
  let participant: Participant;

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
      const quiz = await prisma.quiz.create({
        data: {
          point: 20,
          questionText: "取得テスト問題",
          answerText: "取得テスト解答",
          tournamentId: tournament.id,
          participantId: participant.id,
        },
      });

      const res = await request(app).get(`/quizzes/${quiz.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(quiz.id);
      expect(res.body.questionText).toBe("取得テスト問題");
    });
  });
});
