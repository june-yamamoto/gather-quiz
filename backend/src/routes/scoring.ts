import { Router } from 'express';
import { prisma } from '../db';
import { asyncHandler, pathParameter, pathToTournament, pathToScoring, pathToRevealAnswer, pathToTournamentFinish, pathToTournamentResults } from '../api-helper';
import { NotFoundError, HttpError } from '../errors/HttpErrors';
import { readTeams, validateJudgments } from '../team-scoring';
import type { Prisma } from '@prisma/client';
const router = Router({ mergeParams: true });
/** 親の大会ルートを除いた相対パスにする。 */
const local = (path: string) => path.substring(pathToTournament(':id').length);
/** 終了と採点を大会行のロックで直列化する。 */
async function lockActive(tx: Prisma.TransactionClient, id: string) {
  const locked = await tx.tournament.updateMany({ where: { id, status: 'in_progress' }, data: { status: 'in_progress' } });
  if (!locked.count) throw new HttpError(409, '開催中の大会でのみ操作できます。');
}
router.post(local(pathToRevealAnswer(':id', ':quizId')), asyncHandler(async (req, res) => {
  const id = pathParameter(req.params, 'id'), quizId = pathParameter(req.params, 'quizId');
  const state = await prisma.$transaction(async tx => {
    const tournament = await tx.tournament.findUnique({ where: { id } });
    const quiz = await tx.quiz.findFirst({ where: { id: quizId, tournamentId: id } });
    if (!tournament || !quiz) throw new NotFoundError('大会または問題が見つかりません。');
    const teams = readTeams(tournament.teams);
    if (!teams.length || tournament.status !== 'in_progress') return { teams, judgments: {}, canJudge: false };
    await lockActive(tx, id);
    if (!quiz.isOpened) throw new HttpError(409, '問題ボードから問題を表示してから解答を開いてください。');
    await tx.quiz.update({ where: { id: quizId }, data: { answerRevealed: true } });
    return { teams, judgments: JSON.parse(quiz.judgments), canJudge: true };
  });
  res.json(state);
}));
router.put(local(pathToScoring(':id', ':quizId')), asyncHandler(async (req, res) => {
  const id = pathParameter(req.params, 'id'), quizId = pathParameter(req.params, 'quizId');
  const result = await prisma.$transaction(async tx => {
    await lockActive(tx, id);
    const tournament = await tx.tournament.findUniqueOrThrow({ where: { id } });
    const quiz = await tx.quiz.findFirst({ where: { id: quizId, tournamentId: id } });
    if (!quiz) throw new NotFoundError('問題が見つかりません。');
    if (!quiz.answerRevealed) throw new HttpError(409, '解答表示後に正誤を設定してください。');
    const teams = readTeams(tournament.teams);
    const judgments = validateJudgments(req.body.judgments, teams);
    await tx.quiz.update({ where: { id: quizId }, data: { judgments: JSON.stringify(judgments) } });
    return { teams, judgments, canJudge: true };
  });
  res.json(result);
}));
router.patch(local(pathToTournamentFinish(':id')), asyncHandler(async (req, res) => {
  const id = pathParameter(req.params, 'id');
  await prisma.$transaction(async tx => {
    await lockActive(tx, id);
    const tournament = await tx.tournament.findUniqueOrThrow({ where: { id }, include: { quizzes: true } });
    const teams = readTeams(tournament.teams);
    if (!tournament.quizzes.length || tournament.quizzes.some(q => !q.isOpened)) throw new HttpError(409, 'すべての作成済み問題を表示してから終了してください。');
    if (teams.length && tournament.quizzes.some(q => { const marks = JSON.parse(q.judgments); return !q.answerRevealed || teams.some(team => typeof marks[team.id] !== 'boolean'); })) throw new HttpError(409, '判定が未保存の問題があります。各解答画面で全チームの正誤を保存してください。');
    await tx.tournament.update({ where: { id }, data: { status: 'finished' } });
  });
  res.json({ finished: true });
}));
router.get(local(pathToTournamentResults(':id')), asyncHandler(async (req, res) => {
  const tournament = await prisma.tournament.findUnique({ where: { id: pathParameter(req.params, 'id') }, include: { quizzes: true } });
  if (!tournament) throw new NotFoundError('大会が見つかりません。');
  if (tournament.status !== 'finished') throw new HttpError(409, '順位とスコアは大会終了後に発表します。');
  const scores = readTeams(tournament.teams).map(team => ({ ...team, score: tournament.quizzes.reduce((sum, quiz) => sum + (JSON.parse(quiz.judgments)[team.id] === true ? quiz.point : 0), 0) })).sort((a, b) => b.score - a.score);
  const rankings = scores.map(team => ({ ...team, rank: scores.findIndex(other => other.score === team.score) + 1 }));
  res.json({ tournamentName: tournament.name, rankings });
}));
export default router;
