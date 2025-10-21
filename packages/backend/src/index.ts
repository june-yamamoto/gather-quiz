import express, { Express, Request, Response } from 'express';
import tournamentsRouter from './routes/tournaments';
import quizzesRouter from './routes/quizzes';
import participantsRouter from './routes/participants';
import uploadRouter from './routes/upload';
import {
  pathToQuizzes,
  pathToParticipants,
  pathToTournaments,
  pathToUploadImage,
} from './api-helper';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});
app.use(pathToQuizzes(), quizzesRouter);
app.use(pathToParticipants(':tournamentId'), participantsRouter);
app.use(pathToTournaments(), tournamentsRouter);
app.use(pathToUploadImage().replace('/image', ''), uploadRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
