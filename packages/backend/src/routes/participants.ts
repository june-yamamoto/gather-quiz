import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { pathToParticipantQuizzes, pathToParticipants, asyncHandler } from '../api-helper';
import { Quiz } from '../model/Quiz';
import { NotFoundError } from '../errors/HttpErrors';

const prisma = new PrismaClient();
// 親ルーターから送られてくる:tournamentIdのようなパラメータを取得可能にする
const router = Router({ mergeParams: true });

/**
 * @file 参加者（Participant）に関連するAPIエンドポイントのルーター
 * @module routes/participants
 * @see module:routes/tournaments
 */

/** 参加者オブジェクトに関するAPIのrouter向けパスを取得する関数 */
const participantsRouterPath = (path: string) => path.substring(pathToParticipants(':tournamentId').length);

/**
 * 指定された参加者が作成したクイズの一覧と、問題の作成状況を取得するエンドポイント
 * @route GET /:participantId/quizzes
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {string} req.params.tournamentId - 対象の大会ID (親ルーターから引き継ぎ)
 * @param {string} req.params.participantId - 対象の参加者ID
 * @returns {object} 作成済みクイズリストと問題作成状況を含むオブジェクト
 * @throws {NotFoundError} 指定されたIDの参加者が見つからない場合
 */
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
