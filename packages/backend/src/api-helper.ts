import { Request, Response, NextFunction } from 'express';

const API_ROOT = '/api';

export const pathToTournaments = () => `${API_ROOT}/tournaments`;
export const pathToTournament = (id: string) => `${pathToTournaments()}/${id}`;
export const pathToTournamentLogin = (id: string) => `${pathToTournament(id)}/login`;
export const pathToTournamentStatus = (id: string) => `${pathToTournament(id)}/status`;
export const pathToTournamentStart = (id: string) => `${pathToTournament(id)}/start`;
export const pathToTournamentBoard = (id: string) => `${pathToTournament(id)}/board`;

export const pathToParticipants = (tournamentId: string) => `${pathToTournament(tournamentId)}/participants`;
export const pathToParticipantQuizzes = (tournamentId: string, participantId: string) =>
  `${pathToParticipants(tournamentId)}/${participantId}/quizzes`;

export const pathToQuizzes = () => `${API_ROOT}/quizzes`;
export const pathToQuiz = (id: string) => `${pathToQuizzes()}/${id}`;

export const pathToUploadImage = () => `${API_ROOT}/upload/image`;

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * 非同期なExpressルートハンドラをラップし、発生したエラーをnext()に渡すことで、
 * Expressの共通エラーハンドリングミドルウェアで処理できるようにするユーティリティ関数。
 * @param {AsyncRequestHandler} fn - ラップする非同期ルートハンドラ
 * @returns Expressのルートハンドラとして使用できる関数
 */
export const asyncHandler = (fn: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};
