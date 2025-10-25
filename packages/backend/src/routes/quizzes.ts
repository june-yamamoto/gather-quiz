import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { pathToQuiz, pathToQuizzes, asyncHandler } from '../api-helper';
import { Quiz } from '../model/Quiz';
import { BadRequestError, NotFoundError } from '../errors/HttpErrors';

const prisma = new PrismaClient();
const router = Router();

/** クイズオブジェクトに関するAPIのrouter向けパスを取得する関数 */
const quizzesRouterPath = (path: string) => path.substring(pathToQuizzes().length);

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

router.put(
  quizzesRouterPath(pathToQuiz(':id')),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { point, questionText, questionImage, questionLink, answerText, answerImage, answerLink } = req.body;

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
