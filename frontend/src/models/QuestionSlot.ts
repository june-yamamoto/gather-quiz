export type QuestionSlot = { label: string; choiceCount: number; questionType?: 'normal' | 'choice' };

/** API境界で枠設定を検証し、旧レスポンスは通常問題へ移行する。 */
export function parseQuestionSlots(value: unknown): QuestionSlot[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error('問題枠の形式が不正です。');
  return value.map((slot: unknown) => {
    if (!slot || typeof slot !== 'object' || !('label' in slot) || typeof slot.label !== 'string' ||
        !('choiceCount' in slot) || typeof slot.choiceCount !== 'number' || !Number.isInteger(slot.choiceCount) ||
        (slot.choiceCount !== 0 && (slot.choiceCount < 2 || slot.choiceCount > 20))) throw new Error('問題枠の形式が不正です。');
    if ('questionType' in slot && slot.questionType !== 'normal' && slot.questionType !== 'choice') throw new Error('出題形式が不正です。');
    return { label: slot.label, choiceCount: slot.choiceCount, ...('questionType' in slot ? { questionType: slot.questionType as 'normal' | 'choice' } : {}) };
  });
}
