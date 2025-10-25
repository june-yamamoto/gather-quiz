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

/**
 * @file 大会（Tournament）に関連するAPIエンドポイントのルーター
 * @module routes/tournaments
 */

/** 大会オブジェクトに関するAPIのrouter向けパスを取得する関数 */
const tournamentsRouterPath = (path: string) => path.substring(pathToTournaments().length);

router.use(tournamentsRouterPath(pathToParticipants(':tournamentId')), participantsRouter);

/**
 * 新しい大会を作成するエンドポイント
 * @route POST /
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @body {string} name - 大会名
 * @body {string} password - 管理用パスワード
 * @body {number} questionsPerParticipant - 参加者1人あたりの問題作成数
 * @body {string} points - 各問題の配点 (カンマ区切り)
 * @body {string | null} regulation - レギュレーション
 * @returns {Tournament} 作成された大会オブジェクト
 */
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

/**
 * 指定されたIDの大会情報を取得するエンドポイント
 * @route GET /:id
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {string} req.params.id - 取得対象の大会ID
 * @returns {Tournament} 取得した大会オブジェクト
 * @throws {NotFoundError} 指定されたIDの大会が見つからない場合
 */
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

/**
 * 指定された大会に新しい参加者を作成するエンドポイント
 * @route POST /:id/participants
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {string} req.params.id - 対象の大会ID
 * @body {string} name - 新しい参加者の名前
 * @returns {Participant} 作成された参加者オブジェクト
 */
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

/**
 * 主催者として大会にログインするためのエンドポイント
 * @route POST /:id/login
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスンスオブジェクト
 * @param {string} req.params.id - 対象の大会ID
 * @body {string} password - 管理用パスワード
 * @returns {object} ログイン成功を示すオブジェクト
 * @throws {NotFoundError} 指定されたIDの大会が見つからない場合
 * @throws {UnauthorizedError} パスワードが不正な場合
 */
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

/**
 * 大会のステータス（参加者の問題作成状況など）を取得するエンドポイント
 * @route GET /:id/status
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {string} req.params.id - 対象の大会ID
 * @returns {object} 大会名と参加者のステータスリストを含むオブジェクト
 * @throws {NotFoundError} 指定されたIDの大会が見つからない場合
 */
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

/**
 * 指定されたIDの大会情報を更新するエンドポイント
 * @route PUT /:id
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {string} req.params.id - 更新対象の大会ID
 * @body {string} [name] - 新しい大会名
 * @body {string} [password] - 新しい管理用パスワード
 * @body {number} [questionsPerParticipant] - 新しい問題作成数
 * @body {string} [points] - 新しい配点
 * @body {string | null} [regulation] - 新しいレギュレーション
 * @returns {Tournament} 更新された大会オブジェクト
 * @throws {NotFoundError} 指定されたIDの大会が見つからない場合
 */
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

/**
 * 大会を開始状態に更新するエンドポイント
 * @route PATCH /:id/start
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {string} req.params.id - 対象の大会ID
 * @returns {Tournament} ステータスが更新された大会オブジェクト
 * @throws {NotFoundError} 指定されたIDの大会が見つからない場合
 */
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

/**
 * 大会ボードページに必要な、参加者と各参加者が作成したクイズの情報を取得するエンドポイント
 * @route GET /:id/board
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {string} req.params.id - 対象の大会ID
 * @returns {Tournament} 参加者とクイズの情報を含む大会オブジェクト
 * @throws {NotFoundError} 指定されたIDの大会が見つからない場合
 */
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
