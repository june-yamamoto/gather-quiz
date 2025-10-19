import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { question, options, answer, point, tournamentId, participantId } =
      req.body;

    // Basic validation
    if (
      !question ||
      !options ||
      !answer ||
      !point ||
      !tournamentId ||
      !participantId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Temporary: Combine question and options into the question field
    const questionWithOptions = JSON.stringify({ question, options });

    const quiz = await prisma.quiz.create({
      data: {
        question: questionWithOptions,
        answer,
        point,
        tournament: { connect: { id: tournamentId } },
        participant: { connect: { id: participantId } },
      },
    });
    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Quiz creation failed" });
  }
});

export default router;
