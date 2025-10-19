import express, { Express, Request, Response } from "express";
import tournamentsRouter from "./routes/tournaments";
import quizzesRouter from "./routes/quizzes";
import participantsRouter from "./routes/participants";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/api/tournaments", tournamentsRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/participants", participantsRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
