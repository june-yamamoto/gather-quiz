/**
 * @file Expressアプリケーションのエントリーポイントです。
 *       ミドルウェアの設定、ルーターのマウント、サーバーの起動を行います。
 * @module index
 */

import express, { Express, Request, Response } from 'express';
import tournamentsRouter from './routes/tournaments';
import quizzesRouter from './routes/quizzes';
import participantsRouter from './routes/participants';
import uploadRouter from './routes/upload';
import { errorHandler } from './middleware/errorHandler';

export const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.path}`);
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/upload', uploadRouter);

// Error handling middleware must be last
app.use(errorHandler);

// Start server only when running this file directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}
