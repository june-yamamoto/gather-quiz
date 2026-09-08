import axios, { type AxiosInstance } from 'axios';
import { ApiError } from '../errors/ApiError';
import { validateMediaFile } from '../helpers/media';

/**
 * @file 画像アップロード関連のAPIエンドポイントと通信するためのクライアントクラス
 * @module api/UploadApiClient
 */

/**
 * アップロード関連のAPI呼び出しをまとめたクラス
 */
class UploadApiClient {
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
   * サーバーにリクエストを送信し、画像アップロード用の署名付きURLを取得します。
   * @private
   * @param {File} file - アップロードするファイル
   * @param {string} tournamentId - 大会ID
   * @param {string} participantId - 参加者ID
   * @returns {Promise<{ signedUrl: string, objectUrl: string }>} 署名付きURLとオブジェクトURL
   * @throws {ApiError} APIリクエストが失敗した場合
   */
  private async getSignedUrl(
    file: File,
    tournamentId: string,
    participantId: string,
    media = false
  ): Promise<{ signedUrl: string; objectUrl: string }> {
    try {
      const response = await this.client.post(media ? '/upload/media' : '/upload/image', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        tournamentId,
        participantId,
      }, { timeout: 30000 });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message || error.response.data.error || 'アップロードの準備に失敗しました。', error.response.status);
      }
      throw new Error('アップロードの準備に失敗しました。接続を確認して再試行してください。');
    }
  }

  /**
   * S3に画像をアップロードします。
   * 内部で署名付きURLを取得し、そのURLに対してファイルをPUTします。
   * @param {File} file - アップロードするファイル
   * @param {string} tournamentId - 大会ID
   * @param {string} participantId - 参加者ID
   * @returns {Promise<string>} アップロードされた画像のURL
   * @throws {ApiError} 署名付きURLの取得またはアップロードに失敗した場合
   */
  public async uploadImage(file: File, tournamentId: string, participantId: string): Promise<string> {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'].includes(file.type) || file.size <= 0 || file.size > 10 * 1024 * 1024) {
      throw new Error('画像は10 MB以下のJPEG・PNG・GIF・WebP・AVIFを選択してください。');
    }
    return this.upload(file, tournamentId, participantId, false);
  }

  /** 動画・音声はAPIへ本体を送らず、サイズを検証してS3へ直接送信する。 */
  public async uploadMedia(file: File, tournamentId: string, participantId: string): Promise<string> {
    const error = validateMediaFile(file);
    if (error) throw new Error(error);
    return this.upload(file, tournamentId, participantId, true);
  }

  /** 署名取得・転送には上限時間を設け、失敗時はフォームから再試行できるようにする。 */
  private async upload(file: File, tournamentId: string, participantId: string, media: boolean): Promise<string> {
    const { signedUrl, objectUrl } = await this.getSignedUrl(file, tournamentId, participantId, media);

    try {
      await axios.put(signedUrl, file, {
        headers: { 'Content-Type': file.type },
        timeout: 300000,
      });
      return objectUrl;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError('ファイルのアップロードに失敗しました。再試行してください。', error.response.status);
      }
      throw new Error('ファイルのアップロードが完了しませんでした。接続を確認して再試行してください。');
    }
  }
}

export const uploadApiClient = new UploadApiClient();
