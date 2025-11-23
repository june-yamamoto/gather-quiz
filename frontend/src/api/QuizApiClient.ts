import axios, { type AxiosInstance } from 'axios';
import { Quiz } from '../models/Quiz';
import { ApiError } from '../errors/ApiError';

/**
 * @file クイズ（Quiz）関連のAPIエンドポイントと通信するためのクライアントクラス
 * @module api/QuizApiClient
 */

/**
 * クイズ関連のAPI呼び出しをまとめたクラス
 */
class QuizApiClient {
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
   * 指定されたIDのクイズ情報を取得します。
   * @param {string} id - クイズID
   * @returns {Promise<Quiz>} クイズ情報
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async get(id: string): Promise<Quiz> {
    try {
      const response = await this.client.get(`/quizzes/${id}`);
      return Quiz.fromApi(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * 新しいクイズを作成します。
   * @param {object} quizData - 作成するクイズのデータ
   * @returns {Promise<Quiz>} 作成されたクイズ情報
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async create(quizData: object): Promise<Quiz> {
    try {
      const response = await this.client.post('/quizzes', quizData);
      return Quiz.fromApi(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const quizApiClient = new QuizApiClient();
