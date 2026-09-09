import { verifyPassword, derive } from './password';
import { BadRequestError, HttpError, UnauthorizedError } from './errors/HttpErrors';
import { prisma } from './db';

/** 表示名とログインIDを分離し、入力条件をAPIでも強制する。 */
export function validateRegistration(name: unknown, loginId: unknown, password: unknown) {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 20) throw new BadRequestError('表示名は1〜20文字で入力してください。');
  if (typeof loginId !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,19}$/.test(loginId)) throw new BadRequestError('IDは3〜20文字の半角英数字・ハイフン・アンダースコアで、先頭は英数字にしてください。');
  if (typeof password !== 'string' || !/^[a-zA-Z0-9]{4,6}$/.test(password)) throw new BadRequestError('パスワードは半角英数字4〜6文字で入力してください。数字のみでも登録できます。');
  return { name: name.trim(), loginId: loginId.toLowerCase(), password };
}

/** Lambdaの複数インスタンスでも共有するDBカウンターで総当たりを制限する。 */
export async function loginParticipant(tournamentId: string, loginId: unknown, password: unknown) {
  if (typeof loginId !== 'string' || !loginId || loginId.length > 100 || typeof password !== 'string' || password.length > 128) throw new UnauthorizedError('IDまたはパスワードが違います。');
  const participant = await prisma.participant.findFirst({ where: { tournamentId, OR: [{ loginId: loginId.toLowerCase() }, { loginId: null, name: loginId }] } });
  if (!participant) {
    await derive(password, '00000000000000000000000000000000');
    throw new UnauthorizedError('IDまたはパスワードが違います。');
  }
  const now = new Date();
  const expired = new Date(now.getTime() - 15 * 60 * 1000);
  await prisma.participant.updateMany({ where: { id: participant.id, OR: [{ loginWindowStart: null }, { loginWindowStart: { lte: expired } }] }, data: { loginAttempts: 0, loginWindowStart: now } });
  const reserved = await prisma.participant.updateMany({ where: { id: participant.id, loginAttempts: { lt: 5 } }, data: { loginAttempts: { increment: 1 } } });
  if (!reserved.count) throw new HttpError(429, 'ログイン試行回数の上限です。15分後に再試行してください。');
  if (!await verifyPassword(password, participant.password)) throw new UnauthorizedError('IDまたはパスワードが違います。');
  await prisma.participant.update({ where: { id: participant.id }, data: { loginAttempts: 0, loginWindowStart: null } });
  return participant;
}
