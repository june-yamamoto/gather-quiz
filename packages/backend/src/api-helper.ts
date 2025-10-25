import { Request, Response, NextFunction } from 'express';

/**
 * @file APIエンドポイントのパス生成や非同期処理のラップなど、API関連のヘルパー関数を提供します。
 * @module api-helper
 */

const API_ROOT = '/api';

/**
 * 大会一覧エンドポイントのパスを返します。
 * @returns {string} '/api/tournaments'
 */
export const pathToTournaments = () => `${API_ROOT}/tournaments`;

/**
 * 個別の大会エンドポイントのパスを返します。
 * @param {string} id - 大会ID
 * @returns {string} '/api/tournaments/:id'
 */
export const pathToTournament = (id: string) => `${pathToTournaments()}/${id}`;

/**
 * 大会ログインエンドポイントのパスを返します。
 * @param {string} id - 大会ID
 * @returns {string} '/api/tournaments/:id/login'
 */
export const pathToTournamentLogin = (id: string) => `${pathToTournament(id)}/login`;

/**
 * 大会ステータスエンドポイントのパスを返します。
 * @param {string} id - 大会ID
 * @returns {string} '/api/tournaments/:id/status'
 */
export const pathToTournamentStatus = (id: string) => `${pathToTournament(id)}/status`;

/**
 * 大会開始エンドポイントのパスを返します。
 * @param {string} id - 大会ID
 * @returns {string} '/api/tournaments/:id/start'
 */
export const pathToTournamentStart = (id: string) => `${pathToTournament(id)}/start`;

/**
 * 大会ボードエンドポイントのパスを返します。
 * @param {string} id - 大会ID
 * @returns {string} '/api/tournaments/:id/board'
 */
export const pathToTournamentBoard = (id: string) => `${pathToTournament(id)}/board`;

/**
 * 参加者一覧エンドポイントのパスを返します。
 * @param {string} tournamentId - 大会ID
 * @returns {string} '/api/tournaments/:tournamentId/participants'
 */
export const pathToParticipants = (tournamentId: string) => `${pathToTournament(tournamentId)}/participants`;

/**
 * 特定の参加者のクイズ一覧エンドポイントのパスを返します。
 * @param {string} tournamentId - 大会ID
 * @param {string} participantId - 参加者ID
 * @returns {string} '/api/tournaments/:tournamentId/participants/:participantId/quizzes'
 */
export const pathToParticipantQuizzes = (tournamentId: string, participantId: string) =>
  `${pathToParticipants(tournamentId)}/${participantId}/quizzes`;

/**
 * クイズ一覧エンドポイントのパスを返します。
 * @returns {string} '/api/quizzes'
 */
export const pathToQuizzes = () => `${API_ROOT}/quizzes`;

/**
 * 個別のクイズエンドポイントのパスを返します。
 * @param {string} id - クイズID
 * @returns {string} '/api/quizzes/:id'
 */
export const pathToQuiz = (id: string) => `${pathToQuizzes()}/${id}`;

/**
 * 画像アップロードエンドポイントのパスを返します。
 * @returns {string} '/api/upload/image'
 */
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
