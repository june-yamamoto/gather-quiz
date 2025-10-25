import { Quiz } from '../model/Quiz';
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
} from '../api-helper';
import { Tournament } from '../model/Tournament';
import { Participant } from '../model/Participant';

const prisma = new PrismaClient();
const router = Router();

/** 大会オブジェクトに関するAPIのrouter向けパスを取得する関数 */
const tournamentsRouterPath = (path: string) => path.substring(pathToTournaments().length);

router.use(tournamentsRouterPath(pathToParticipants(':tournamentId')), participantsRouter);

router.post('/', async (req: Request, res: Response) => {
  try {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    res.status(500).json({ error: 'Tournament creation failed' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });
    if (tournament) {
      res.json(new Tournament(tournament));
    } else {
      res.status(404).json({ error: 'Tournament not found' });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tournament' });
  }
});

router.post(tournamentsRouterPath(pathToParticipants(':id')), async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Participant creation failed' });
  }
});

router.post(tournamentsRouterPath(pathToTournamentLogin(':id')), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.password === password) {
      // 本番環境ではセッション管理のためにJWTなどのトークンを発行するが、ここでは成功ステータスのみ返す
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get(tournamentsRouterPath(pathToTournamentStatus(':id')), async (req: Request, res: Response) => {
  try {
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
      return res.status(404).json({ error: 'Tournament not found' });
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve tournament status' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, password, questionsPerParticipant, points, regulation } = req.body;

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

router.patch(tournamentsRouterPath(pathToTournamentStart(':id')), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedTournament = await prisma.tournament.update({
      where: { id },
      data: {
        status: 'in_progress',
      },
    });
    res.json(new Tournament(updatedTournament));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start tournament' });
  }
});

router.get(tournamentsRouterPath(pathToTournamentBoard(':id')), async (req: Request, res: Response) => {
  try {
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
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Prismaのレスポンスをモデルクラスのインスタンスに変換する
    const participants = tournamentWithRelations.participants.map((p) => {
      const quizzes = p.quizzes.map((q) => new Quiz(q));
      // @ts-ignore
      return new Participant({ ...p, quizzes });
    });

    const tournament = new Tournament({ ...tournamentWithRelations, participants });

    res.json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve board data' });
  }
});

export default router;
