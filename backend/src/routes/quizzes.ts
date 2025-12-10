import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { asyncHandler, pathToQuizzes, pathToQuiz } from '../api-helper';
import { BadRequestError, NotFoundError } from '../errors/HttpErrors';
import { Quiz } from '../model/Quiz';
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
 * @body {number} [order] - 問題順序
 * @body {string} tournamentId - 紐づく大会のID
 * @body {string} participantId - 紐づく参加者のID
 * @body {string} [genre] - ジャンル
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
      order,
      questionText,
      questionImage,
      questionLink,
      answerText,
      answerImage,
      answerLink,
      tournamentId,
      participantId,
      genre,
    } = req.body;

    if (!point || !tournamentId || !participantId) {
      throw new BadRequestError('Missing required fields');
    }

    if (!questionText && !questionImage) {
      throw new BadRequestError('Question text or image is required');
    }

    if (!answerText && !answerImage) {
      throw new BadRequestError('Answer text or image is required');
    }

    const quiz = await prisma.quiz.create({
      data: {
        point,
        order: order || 0,
        questionText,
        questionImage,
        questionLink,
        answerText,
        answerImage,
        answerLink,
        genre,
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
      include: { participant: true },
    });
    if (quiz) {
      // 問題詳細を取得した時点で既読(isOpened)にする
      // ただし、プレビューモード(preview=true)の場合は既読にしない
      if (!quiz.isOpened && preview !== 'true') {
        await prisma.quiz.update({
          where: { id },
          data: { isOpened: true },
        });
        // 更新後の値を反映
        quiz.isOpened = true;
      }
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
 * @body {string} [genre] - 新しいジャンル
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
    const { point, questionText, questionImage, questionLink, answerText, answerImage, answerLink, genre } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });
    if (!quiz) {
      throw new NotFoundError('The requested resource was not found.');
    }

    // 更新後の値を予測してバリデーションを行う
    // リクエストボディに値が含まれていればそれを、なければ既存の値を使用する
    // 注意: 空文字列への更新を許可する場合は、undefined判定を行う必要がある
    const nextQuestionText = questionText !== undefined ? questionText : quiz.questionText;
    const nextQuestionImage = questionImage !== undefined ? questionImage : quiz.questionImage;
    const nextAnswerText = answerText !== undefined ? answerText : quiz.answerText;
    const nextAnswerImage = answerImage !== undefined ? answerImage : quiz.answerImage;

    if (!nextQuestionText && !nextQuestionImage) {
      throw new BadRequestError('Question text or image is required');
    }
    if (!nextAnswerText && !nextAnswerImage) {
      throw new BadRequestError('Answer text or image is required');
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
        genre,
      },
    });
    res.status(200).json(new Quiz(updatedQuiz));
  })
);

export default router;
