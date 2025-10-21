import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// 親ルーターから送られてくる:tournamentIdのようなパラメータを取得可能にする
const router = Router({ mergeParams: true });

router.get('/:participantId/quizzes', async (req: Request, res: Response) => {
  try {
    const { participantId } = req.params;

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        // 残りの問題数を計算するために大会情報が必要
        tournament: true,
        // 作成済みのクイズ一覧を返すためにクイズ情報が必要
        quizzes: true,
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
