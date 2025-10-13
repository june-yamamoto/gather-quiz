
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

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

export default router;
