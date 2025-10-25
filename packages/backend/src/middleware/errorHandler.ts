import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/HttpErrors';

/**
 * Express用の共通エラーハンドリングミドルウェア
 * @param {Error} err - 発生したエラー
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {NextFunction} next - 次のミドルウェアへの関数
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // HttpErrorのインスタンスかチェック
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prismaのエラーコードをチェック
  if ('code' in err && err.code === 'P2025') {
    return res.status(404).json({ error: 'The requested resource was not found.' });
  }

  // その他の不明なエラー
  console.error(err);
  // TODO: 本番環境では、エラーの詳細をログに出力し、汎用的なメッセージを返すようにする
  return res.status(500).json({ error: 'Internal Server Error' });
};
