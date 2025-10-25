import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { pathToParticipantQuizzes, pathToParticipants, asyncHandler } from '../api-helper';
import { Quiz } from '../model/Quiz';
import { NotFoundError } from '../errors/HttpErrors';

const prisma = new PrismaClient();
// 親ルーターから送られてくる:tournamentIdのようなパラメータを取得可能にする
const router = Router({ mergeParams: true });

/** 参加者オブジェクトに関するAPIのrouter向けパスを取得する関数 */
const participantsRouterPath = (path: string) => path.substring(pathToParticipants(':tournamentId').length);

router.get(
  participantsRouterPath(pathToParticipantQuizzes(':tournamentId', ':participantId')),
  asyncHandler(async (req: Request, res: Response) => {
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
      throw new NotFoundError('Participant not found');
    }

    const requiredQuestions = participant.tournament.questionsPerParticipant;
    const createdQuizzes = participant.quizzes.map((q) => new Quiz(q));
    const createdQuestionsCount = createdQuizzes.length;
    const remainingQuestions = requiredQuestions - createdQuestionsCount;

    res.json({
      createdQuizzes,
      remainingQuestions,
      requiredQuestions,
      createdQuestionsCount,
    });
  })
);

export default router;
