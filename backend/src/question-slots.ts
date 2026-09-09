import { BadRequestError, NotFoundError } from './errors/HttpErrors';
import { prisma } from './db';

export type QuestionSlot = { label: string; choiceCount: number; questionType?: 'normal' | 'choice' };

/** 旧大会の未指定形式は保持し、新設定だけを厳密に検証する。 */
export function validateQuestionSlots(value: unknown, count: unknown, points: unknown): QuestionSlot[] {
  if (!Number.isInteger(count) || Number(count) < 1 || Number(count) > 10 || typeof points !== 'string' ||
      points.split(',').length !== count || points.split(',').some(p => !Number.isInteger(Number(p)) || Number(p) < 1 || Number(p) > 2147483647) ||
      !Array.isArray(value) || value.length !== count) {
    throw new BadRequestError('問題数・配点・問題枠の数を一致させてください。');
  }
  return value.map((slot: unknown) => {
    if (!slot || typeof slot !== 'object' || !('label' in slot) || typeof slot.label !== 'string' || slot.label.trim().length > 50 ||
        !('choiceCount' in slot) || typeof slot.choiceCount !== 'number' || !Number.isInteger(slot.choiceCount) ||
        (slot.choiceCount !== 0 && (slot.choiceCount < 2 || slot.choiceCount > 20))) {
      throw new BadRequestError('ラベルは50文字以内、選択肢数は2〜20の整数で指定してください。');
    }
    if ('questionType' in slot && slot.questionType !== 'normal' && slot.questionType !== 'choice') throw new BadRequestError('出題形式は通常問題または選択問題を指定してください。');
    return { label: slot.label.trim(), choiceCount: slot.choiceCount, ...('questionType' in slot ? { questionType: slot.questionType as 'normal' | 'choice' } : {}) };
  });
}

/** DBにはJSON文字列、APIには配列として保持する。 */
export function readQuestionSlots(value: string | null | undefined): QuestionSlot[] {
  return value ? JSON.parse(value) : [];
}

/** 指定数の入力を必須とし、通常問題へ選択肢が紛れ込むことを防ぐ。 */
export function validateChoices(value: unknown, count: number): string[] {
  const choices = value === undefined ? [] : value;
  if (!Array.isArray(choices) || choices.length !== count || choices.some(c => typeof c !== 'string' || !c.trim() || c.trim().length > 100)) {
    throw new BadRequestError(count ? `${count}個の選択肢を各1〜100文字で入力してください。` : '通常問題には選択肢を設定できません。');
  }
  return choices.map(c => c.trim());
}

/** クライアント指定の形式ではなく、大会に割り当てられた枠を使用する。 */
export async function assignedSlot(tournamentId: string, participantId: string, order: unknown, point: unknown): Promise<QuestionSlot> {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) throw new NotFoundError('Tournament not found');
  const participant = await prisma.participant.findUnique({ where: { id: participantId } });
  if (!participant || participant.tournamentId !== tournamentId) throw new BadRequestError('参加者と大会が一致しません。');
  if (!tournament.questionSlots) return { label: '', choiceCount: 0 };
  const slots = readQuestionSlots(tournament.questionSlots);
  if (typeof order !== 'number' || !Number.isInteger(order) || order < 0 || !slots[order] || Number(tournament.points.split(',')[order]) !== point) {
    throw new BadRequestError('大会で指定された問題枠・配点を使用してください。');
  }
  return slots[order];
}

/** 主催者指定の形式を守り、参加者が選んだ択数を検証する。 */
export function validateChoiceCount(value: unknown, questionType?: QuestionSlot['questionType']): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || (value !== 0 && (value < 2 || value > 20))) throw new BadRequestError('選択肢数は2〜20の整数で指定してください。');
  if ((questionType === 'normal' && value !== 0) || (questionType === 'choice' && value === 0)) throw new BadRequestError('大会で指定された出題形式を使用してください。');
  return value;
}
