import axios from 'axios';
import { ApiError } from '../errors/ApiError';
import type { Team } from '../models/Team';
export type JudgmentState = { teams: Team[]; judgments: Record<string, boolean>; canJudge: boolean };
export type Results = { tournamentName: string; rankings: (Team & { rank: number; score: number })[] };
const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });
/** 採点操作の失敗理由を画面に渡す。 */
async function request<T>(method: 'get' | 'post' | 'put' | 'patch', url: string, data?: unknown): Promise<T> {
  try { return (await client.request<T>({ method, url, data })).data; }
  catch (error) { if (axios.isAxiosError(error) && error.response) throw new ApiError(error.response.data.message || error.response.data.error || '操作に失敗しました。', error.response.status); throw new Error('通信に失敗しました。再試行してください。'); }
}
export const scoringApiClient = {
  /** 実際の解答表示後、採点画面を開く。 */
  reveal: (id: string, quizId: string) => request<JudgmentState>('post', `/tournaments/${id}/scoring/${quizId}/reveal`),
  /** 同じ問題の判定を置き換える。累積加算はしない。 */
  save: (id: string, quizId: string, judgments: Record<string, boolean>) => request<JudgmentState>('put', `/tournaments/${id}/scoring/${quizId}`, { judgments }),
  /** 全問題の判定確認後に終了する。 */
  finish: (id: string) => request<{ finished: boolean }>('patch', `/tournaments/${id}/finish`),
  /** 終了後だけ順位を取得する。 */
  results: (id: string) => request<Results>('get', `/tournaments/${id}/results`),
};
