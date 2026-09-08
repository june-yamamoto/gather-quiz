import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/HttpErrors';

/**
 * Express用の共通エラーハンドリングミドルウェア
 * @param {Error} err - 発生したエラー
 * @param {Request} req - Expressリクエストオブジェクト
 * @param {Response} res - Expressレスポンスオブジェクト
 * @param {NextFunction} next - 次のミドルウェアへの関数
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Prismaの詳細にはパスワードや行データが含まれるため、識別情報だけを残す。
  console.error('[ErrorHandler] Error occurred:', {
    name: err.name,
    code: 'code' in err ? err.code : undefined,
    path: req.path,
  });

  // HttpErrorのインスタンスかチェック
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prismaのエラーコードをチェック
  if ('code' in err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'The requested resource was not found.' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Unique constraint violation' });
    }
  }

  // その他の不明なエラー
  // TODO: 本番環境では、エラーの詳細をログに出力し、汎用的なメッセージを返すようにする
  return res.status(500).json({ error: 'Internal Server Error' });
};
