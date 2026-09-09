export type Team = { id: string; name: string };
/** 旧大会は空配列として読み込み、新APIのチームを検証する。 */
export function parseTeams(value: unknown): Team[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some(team => !team || typeof team !== 'object' || typeof team.id !== 'string' || typeof team.name !== 'string')) throw new Error('Invalid team data');
  return value as Team[];
}
