import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import tournamentsRouter from "./tournaments"; // Adjust path as needed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use("/tournaments", tournamentsRouter);

describe("Tournaments API", () => {
  let tournament;

  beforeAll(async () => {
    // Create a tournament for testing
    tournament = await prisma.tournament.create({
      data: {
        name: "Test Tournament for API",
        password: "correct-password",
        questionsPerParticipant: 3,
        points: "10,20,30",
      },
    });
  });

  afterAll(async () => {
    // Clean up the database
    await prisma.tournament.delete({ where: { id: tournament.id } });
    await prisma.$disconnect();
  });

  describe("POST /:id/login", () => {
    it("should return success with correct password", async () => {
      const res = await request(app)
        .post(`/tournaments/${tournament.id}/login`)
        .send({ password: "correct-password" });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return unauthorized with incorrect password", async () => {
      const res = await request(app)
        .post(`/tournaments/${tournament.id}/login`)
        .send({ password: "wrong-password" });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /:id/status", () => {
    it("should return tournament status with participant progress", async () => {
      // Create a participant and a quiz for the test
      const participant = await prisma.participant.create({
        data: {
          name: "Test Participant",
          password: "pw",
          tournamentId: tournament.id,
        },
      });
      await prisma.quiz.create({
        data: {
          question: "Test Question",
          answer: "Test Answer",
          point: 10,
          tournamentId: tournament.id,
          participantId: participant.id,
        },
      });

      const res = await request(app).get(
        `/tournaments/${tournament.id}/status`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.tournamentName).toBe("Test Tournament for API");
      expect(res.body.participants).toHaveLength(1);
      expect(res.body.participants[0].name).toBe("Test Participant");
      expect(res.body.participants[0].created).toBe(1);
      expect(res.body.participants[0].required).toBe(3);

      // Cleanup
      await prisma.quiz.deleteMany({
        where: { participantId: participant.id },
      });
      await prisma.participant.delete({ where: { id: participant.id } });
    });
  });
});
