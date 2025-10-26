import axios, { type AxiosInstance } from 'axios';
import { Tournament } from '../models/Tournament';
import { Participant } from '../models/Participant';
import { ApiError } from '../errors/ApiError';

/**
 * @file 大会（Tournament）関連のAPIエンドポイントと通信するためのクライアントクラス
 * @module api/TournamentApiClient
 */

/**
 * 大会関連のAPI呼び出しをまとめたクラス
 */
class TournamentApiClient {
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
   * 指定されたIDの大会情報を取得します。
   * @param {string} id - 大会ID
   * @returns {Promise<Tournament>} 大会情報
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async get(id: string): Promise<Tournament> {
    try {
      const response = await this.client.get(`/tournaments/${id}`);
      return Tournament.fromApi(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * 大会のステータス（参加者情報など）を取得します。
   * @param {string} id - 大会ID
   * @returns {Promise<any>} 大会のステータス情報
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async getStatus(id: string): Promise<{ tournamentName: string; participants: Participant[] }> {
    try {
      const response = await this.client.get(`/tournaments/${id}/status`);
      return {
        tournamentName: response.data.tournamentName,
        participants: response.data.participants.map(Participant.fromApi),
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * 大会ボードの情報を取得します。
   * @param {string} id - 大会ID
   * @returns {Promise<Tournament>} ボード情報を含む大会情報
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async getBoard(id: string): Promise<Tournament> {
    try {
      const response = await this.client.get(`/tournaments/${id}/board`);
      return Tournament.fromApi(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * 新しい大会を作成します。
   * @param {object} tournamentData - 作成する大会のデータ
   * @returns {Promise<Tournament>} 作成された大会情報
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async create(tournamentData: object): Promise<Tournament> {
    try {
      const response = await this.client.post('/tournaments', tournamentData);
      return Tournament.fromApi(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * 主催者としてログインします。
   * @param {string} id - 大会ID
   * @param {string} password - パスワード
   * @returns {Promise<{success: boolean}>} ログイン成否
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async login(id: string, password: string): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post(`/tournaments/${id}/login`, { password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * 大会情報を更新します。
   * @param {string} id - 大会ID
   * @param {object} tournamentData - 更新する大会のデータ
   * @returns {Promise<Tournament>} 更新された大会情報
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async update(id: string, tournamentData: object): Promise<Tournament> {
    try {
      const response = await this.client.put(`/tournaments/${id}`, tournamentData);
      return Tournament.fromApi(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * 大会を開始します。
   * @param {string} id - 大会ID
   * @returns {Promise<void>}
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async start(id: string): Promise<void> {
    try {
      await this.client.patch(`/tournaments/${id}/start`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * 新しい参加者を大会に登録します。
   * @param {string} tournamentId - 大会ID
   * @param {object} participantData - 参加者データ
   * @returns {Promise<Participant>} 登録された参加者情報
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  public async createParticipant(tournamentId: string, participantData: { name: string }): Promise<Participant> {
    try {
      const response = await this.client.post(`/tournaments/${tournamentId}/participants`, participantData);
      return Participant.fromApi(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export const tournamentApiClient = new TournamentApiClient();
