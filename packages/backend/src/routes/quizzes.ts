import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      point,
      questionText,
      questionImage,
      questionLink,
      answerText,
      answerImage,
      answerLink,
      tournamentId,
      participantId,
    } = req.body;

    if (!point || !tournamentId || !participantId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        point,
        questionText,
        questionImage,
        questionLink,
        answerText,
        answerImage,
        answerLink,
        tournament: { connect: { id: tournamentId } },
        participant: { connect: { id: participantId } },
      },
    });
    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Quiz creation failed' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });
    if (quiz) {
      res.json(quiz);
    } else {
      res.status(404).json({ error: 'Quiz not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve quiz' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      point,
      questionText,
      questionImage,
      questionLink,
      answerText,
      answerImage,
      answerLink,
    } = req.body;

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        point,
        questionText,
        questionImage,
        questionLink,
        answerText,
        answerImage,
        answerLink,
      },
    });
    res.status(200).json(updatedQuiz);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

export default router;
