import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { pathToQuiz, pathToQuizzes, asyncHandler } from '../api-helper';
import { Quiz } from '../model/Quiz';
import { BadRequestError, NotFoundError } from '../errors/HttpErrors';

const prisma = new PrismaClient();
const router = Router();

/**
 * @file クイズ（Quiz）に関連するAPIエンドポイントのルーター
 * @module routes/quizzes
 */

/** クイズオブジェクトに関するAPIのrouter向けパスを取得する関数 */
const quizzesRouterPath = (path: string) => path.substring(pathToQuizzes().length);

/**
 * 新しいクイズを作成するエンドポイント
 * @route POST /
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @body {number} point - 配点
 * @body {string} tournamentId - 紐づく大会のID
 * @body {string} participantId - 紐づく参加者のID
 * @body {string} [questionText] - 問題文
 * @body {string} [questionImage] - 問題画像URL
 * @body {string} [questionLink] - 問題参考リンク
 * @body {string} [answerText] - 解答文
 * @body {string} [answerImage] - 解答画像URL
 * @body {string} [answerLink] - 解答参考リンク
 * @returns {Quiz} 作成されたクイズオブジェクト
 * @throws {BadRequestError} 必須フィールドが不足している場合
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
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
      throw new BadRequestError('Missing required fields');
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
    res.status(201).json(new Quiz(quiz));
  })
);

/**
 * 指定されたIDのクイズ情報を取得するエンドポイント
 * @route GET /:id
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {string} req.params.id - 取得対象のクイズID
 * @returns {Quiz} 取得したクイズオブジェクト
 * @throws {NotFoundError} 指定されたIDのクイズが見つからない場合
 */
router.get(
  quizzesRouterPath(pathToQuiz(':id')),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });
    if (quiz) {
      res.json(new Quiz(quiz));
    } else {
      throw new NotFoundError('Quiz not found');
    }
  })
);

/**
 * 指定されたIDのクイズ情報を更新するエンドポイント
 * @route PUT /:id
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {string} req.params.id - 更新対象のクイズID
 * @body {number} [point] - 新しい配点
 * @body {string} [questionText] - 新しい問題文
 * @body {string} [questionImage] - 新しい問題画像URL
 * @body {string} [questionLink] - 新しい問題参考リンク
 * @body {string} [answerText] - 新しい解答文
 * @body {string} [answerImage] - 新しい解答画像URL
 * @body {string} [answerLink] - 新しい解答参考リンク
 * @returns {Quiz} 更新されたクイズオブジェクト
 * @throws {NotFoundError} 指定されたIDのクイズが見つからない場合
 */
router.put(
  quizzesRouterPath(pathToQuiz(':id')),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { point, questionText, questionImage, questionLink, answerText, answerImage, answerLink } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });
    if (!quiz) {
      throw new NotFoundError('The requested resource was not found.');
    }

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
    res.status(200).json(new Quiz(updatedQuiz));
  })
);

export default router;
