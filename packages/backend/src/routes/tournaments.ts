import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import participantsRouter from './participants';

const prisma = new PrismaClient();
const router = Router();

router.use('/:tournamentId/participants', participantsRouter);

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
    res.json(tournament);
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
      res.json(tournament);
    } else {
      res.status(404).json({ error: 'Tournament not found' });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tournament' });
  }
});

router.post('/:id/participants', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // For now, generate a random password for the participant.
    // This will be updated later.
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
    res.json(participant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Participant creation failed' });
  }
});

router.post('/:id/login', async (req: Request, res: Response) => {
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
      // In a real application, you would issue a token (e.g., JWT)
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/:id/status', async (req: Request, res: Response) => {
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

    res.json(updatedTournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

router.patch('/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedTournament = await prisma.tournament.update({
      where: { id },
      data: {
        status: 'in_progress',
      },
    });
    res.json(updatedTournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start tournament' });
  }
});

router.get('/:id/board', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            quizzes: true,
          },
        },
      },
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve board data' });
  }
});

export default router;
