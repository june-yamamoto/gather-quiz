import axios, { type AxiosInstance } from 'axios';
import { ApiError } from '../errors/ApiError';

/**
 * アップロード関連のAPI呼び出しをまとめたクラス
 */
class UploadApiClient {
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
   * 画像アップロード用の署名付きURLを取得します。
   * @param {File} file - アップロードするファイル
   * @returns {Promise<{ signedUrl: string, objectUrl: string }>} 署名付きURLとオブジェクトURL
   */
  private async getSignedUrl(file: File): Promise<{ signedUrl: string; objectUrl: string }> {
    try {
      const response = await this.client.post('/upload/image', {
        fileName: file.name,
        fileType: file.type,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
      }
      throw new Error('An unexpected error occurred while getting the signed URL');
    }
  }

  /**
   * S3に画像をアップロードします。
   * @param {File} file - アップロードするファイル
   * @returns {Promise<string>} アップロードされた画像のURL
   * @throws {ApiError} アップロードに失敗した場合
   */
  public async uploadImage(file: File): Promise<string> {
    const { signedUrl, objectUrl } = await this.getSignedUrl(file);

    try {
      await axios.put(signedUrl, file, {
        headers: { 'Content-Type': file.type },
      });
      return objectUrl;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new ApiError('Failed to upload image to S3', error.response.status);
      }
      throw new Error('An unexpected error occurred during S3 upload');
    }
  }
}

export const uploadApiClient = new UploadApiClient();
