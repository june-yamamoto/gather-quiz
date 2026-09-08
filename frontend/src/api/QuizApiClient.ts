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
  /** 本番画面に表示できた問題のみを冪等に既読記録する。 */
  public async markOpened(id: string): Promise<Quiz> {
    try {
      const response = await this.client.put(`/quizzes/${id}/opened`);
      return Quiz.fromApi(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message || error.response.data.error, error.response.status);
      }
      throw new Error('既読の保存に失敗しました。');
    }
  }

  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 指定されたIDのクイズ情報を取得します。
   * @param {string} id - クイズID
   * @param {boolean} [isPreview] - 旧APIとの互換用。現在の取得APIは指定の有無によらず既読を変更しない。
   * @returns {Promise<Quiz>} クイズ情報
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async get(id: string, isPreview?: boolean): Promise<Quiz> {
    try {
      const config = isPreview ? { params: { preview: true } } : {};
      const response = await this.client.get(`/quizzes/${id}`, config);
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

  /**
   * 指定されたIDのクイズ情報を更新します。
   * @param {string} id - クイズID
   * @param {object} quizData - 更新するクイズのデータ
   * @returns {Promise<Quiz>} 更新されたクイズ情報
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async update(id: string, quizData: object): Promise<Quiz> {
    try {
      const response = await this.client.put(`/quizzes/${id}`, quizData);
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
