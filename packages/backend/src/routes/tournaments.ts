import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import participantsRouter from './participants';
import {
  pathToParticipants,
  pathToTournaments,
  pathToTournamentLogin,
  pathToTournamentStatus,
  pathToTournamentStart,
  pathToTournamentBoard,
  asyncHandler,
} from '../api-helper';
import { Tournament } from '../model/Tournament';
import { Participant } from '../model/Participant';
import { Quiz } from '../model/Quiz';
import { NotFoundError, UnauthorizedError } from '../errors/HttpErrors';

const prisma = new PrismaClient();
const router = Router();

/** 大会オブジェクトに関するAPIのrouter向けパスを取得する関数 */
const tournamentsRouterPath = (path: string) => path.substring(pathToTournaments().length);

router.use(tournamentsRouterPath(pathToParticipants(':tournamentId')), participantsRouter);

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, password, questionsPerParticipant, points, regulation } = req.body;
    const tournament = await prisma.tournament.create({
      data: {
        name,
        password,
        questionsPerParticipant,
        points,
        regulation,
      },
    });
    res.json(new Tournament(tournament));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });
    if (tournament) {
      res.json(new Tournament(tournament));
    } else {
      throw new NotFoundError('Tournament not found');
    }
  })
);

router.post(
  tournamentsRouterPath(pathToParticipants(':id')),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    // TODO: パスワードは将来的にユーザーが設定できるようにするが、現在はランダムな文字列を生成して仮対応する
    const password = Math.random().toString(36).slice(-8);

    const participant = await prisma.participant.create({
      data: {
        name,
        password,
        tournament: {
          connect: {
            id,
          },
        },
      },
    });
    res.json(new Participant(participant));
  })
);

router.post(
  tournamentsRouterPath(pathToTournamentLogin(':id')),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { password } = req.body;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      throw new NotFoundError('Tournament not found');
    }

    if (tournament.password === password) {
      // 本番環境ではセッション管理のためにJWTなどのトークンを発行するが、ここでは成功ステータスのみ返す
      res.json({ success: true, message: 'Login successful' });
    } else {
      throw new UnauthorizedError('Invalid password');
    }
  })
);

router.get(
  tournamentsRouterPath(pathToTournamentStatus(':id')),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            _count: {
              select: { quizzes: true },
            },
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundError('Tournament not found');
    }

    const participantStatus = tournament.participants.map(
      (p: { id: string; name: string; _count: { quizzes: number } }) => ({
        id: p.id,
        name: p.name,
        created: p._count.quizzes,
        required: tournament.questionsPerParticipant,
        tournamentId: tournament.id,
      })
    );

    res.json({
      tournamentName: tournament.name,
      participants: participantStatus,
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, password, questionsPerParticipant, points, regulation } = req.body;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });
    if (!tournament) {
      throw new NotFoundError('The requested resource was not found.');
    }

    const updatedTournament = await prisma.tournament.update({
      where: { id },
      data: {
        name,
        password,
        questionsPerParticipant,
        points,
        regulation,
      },
    });

    res.json(new Tournament(updatedTournament));
  })
);

router.patch(
  tournamentsRouterPath(pathToTournamentStart(':id')),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });
    if (!tournament) {
      throw new NotFoundError('The requested resource was not found.');
    }

    const updatedTournament = await prisma.tournament.update({
      where: { id },
      data: {
        status: 'in_progress',
      },
    });
    res.json(new Tournament(updatedTournament));
  })
);

router.get(
  tournamentsRouterPath(pathToTournamentBoard(':id')),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tournamentWithRelations = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            quizzes: true,
          },
        },
      },
    });

    if (!tournamentWithRelations) {
      throw new NotFoundError('Tournament not found');
    }

    // Prismaのレスポンスをモデルクラスのインスタンスに変換する
    const participants = tournamentWithRelations.participants.map((p) => {
      const quizzes = p.quizzes.map((q) => new Quiz(q));
      return new Participant({ ...p, quizzes });
    });

    const tournament = new Tournament({ ...tournamentWithRelations, participants });

    res.json(tournament);
  })
);

export default router;
