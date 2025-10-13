
import express, { Express, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.post('/api/tournaments', async (req: Request, res: Response) => {
  const { name, password } = req.body;
  const tournament = await prisma.tournament.create({
    data: {
      name,
      password,
    },
  });
  res.json(tournament);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
