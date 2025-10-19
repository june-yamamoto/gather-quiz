import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true }); // Enable mergeParams to access :tournamentId

router.get('/:participantId/quizzes', async (req: Request, res: Response) => {
  try {
    const { participantId } = req.params;

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        tournament: true, // Include tournament data
        quizzes: true, // Include quizzes created by the participant
      },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const requiredQuestions = participant.tournament.questionsPerParticipant;
    const createdQuestionsCount = participant.quizzes.length;
    const remainingQuestions = requiredQuestions - createdQuestionsCount;

    res.json({
      createdQuizzes: participant.quizzes,
      remainingQuestions,
      requiredQuestions,
      createdQuestionsCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve quiz status' });
  }
});

export default router;
