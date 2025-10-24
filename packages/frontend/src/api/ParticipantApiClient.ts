import axios, { type AxiosInstance } from 'axios';
import { Quiz } from '../models/Quiz';
import { ApiError } from '../errors/ApiError';

/**
 * 参加者関連のAPI呼び出しをまとめたクラス
 */
class ParticipantApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 指定された参加者が作成したクイズのリストと残りの問題数を取得します。
   * @param {string} tournamentId - 大会ID
   * @param {string} participantId - 参加者ID
   * @returns {Promise<{ createdQuizzes: Quiz[], remainingQuestions: number }>} 作成済みクイズと残り問題数
   */
  public async getQuizzes(
    tournamentId: string,
    participantId: string
  ): Promise<{ createdQuizzes: Quiz[]; remainingQuestions: number }> {
    try {
      const response = await this.client.get(`/tournaments/${tournamentId}/participants/${participantId}/quizzes`);
      return {
        createdQuizzes: response.data.createdQuizzes.map(Quiz.fromApi),
        remainingQuestions: response.data.remainingQuestions,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const participantApiClient = new ParticipantApiClient();
