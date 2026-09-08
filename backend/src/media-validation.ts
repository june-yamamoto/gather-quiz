import { BadRequestError } from './errors/HttpErrors';

/** 拡張子は利用者のファイル名でなく、許可したMIMEから決定する。 */
export const mediaExtensions: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/webm': 'weba',
};

/** URLはサーバーでは取得せず、ブラウザで安全に開ける形式だけを保存する。 */
export const validateQuizLink = (value: unknown): void => {
  if (value === undefined || value === null || value === '') return;
  if (
    typeof value !== 'string' ||
    value.length > 2048 ||
    [...value].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
  ) {
    throw new BadRequestError('URLは2048文字以内のHTTPまたはHTTPS URLを指定してください。');
  }
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid URL');
  } catch {
    throw new BadRequestError('URLは認証情報を含まないHTTPまたはHTTPS URLを指定してください。');
  }
};

/** 空白だけの内容では問題や解答として成立しない。 */
export const hasQuizContent = (...values: unknown[]): boolean =>
  values.some((value) => typeof value === 'string' && value.trim().length > 0);
