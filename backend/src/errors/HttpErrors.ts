/**
 * @file アプリケーションで使用するHTTPエラークラスを定義します。
 * @module errors/HttpErrors
 */

/**
 * HTTPエラーの基底クラス
 */
export class HttpError extends Error {
  statusCode: number;

  /**
   * @constructor
   * @param {number} statusCode - HTTPステータスコード
   * @param {string} message - エラーメッセージ
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

/**
 * 404 Not Found エラー
 */
export class NotFoundError extends HttpError {
  /**
   * @constructor
   * @param {string} [message='Not Found'] - エラーメッセージ
   */
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

/**
 * 400 Bad Request エラー
 */
export class BadRequestError extends HttpError {
  /**
   * @constructor
   * @param {string} [message='Bad Request'] - エラーメッセージ
   */
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

/**
 * 401 Unauthorized エラー
 */
export class UnauthorizedError extends HttpError {
  /**
   * @constructor
   * @param {string} [message='Unauthorized'] - エラーメッセージ
   */
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}
