import { randomUUID } from 'node:crypto';
import { BadRequestError } from './errors/HttpErrors';
export type Team = { id: string; name: string };
/** 保存済みチームは作問者から独立したIDを持つ。 */
export const readTeams = (value?: string | null): Team[] => JSON.parse(value || '[]');
/** 名前の変更でも同じ枠のIDを維持する。開始後の変更禁止はrouteが担う。 */
export function configureTeams(value: unknown, previous: Team[] = []): Team[] {
  if (!Array.isArray(value) || value.length > 50 || value.some(name => typeof name !== 'string' || !name.trim() || name.trim().length > 20)) throw new BadRequestError('チームは50組以内、名前は1〜20文字で入力してください。');
  const names = value.map((name: string) => name.trim());
  if (new Set(names).size !== names.length) throw new BadRequestError('チーム名は重複しないようにしてください。');
  return names.map((name, index) => ({ id: previous[index]?.id || randomUUID(), name }));
}
/** 未判定を誤答と混同せず、全チームのbooleanを要求する。 */
export function validateJudgments(value: unknown, teams: Team[]): Record<string, boolean> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== teams.length || teams.some(team => !Object.hasOwn(value, team.id) || typeof (value as Record<string, unknown>)[team.id] !== 'boolean')) throw new BadRequestError('全チームの正解・不正解を選択してください。');
  return Object.fromEntries(teams.map(team => [team.id, (value as Record<string, boolean>)[team.id]]));
}
