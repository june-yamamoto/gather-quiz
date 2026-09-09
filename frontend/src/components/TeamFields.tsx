import { Box, Typography } from '@mui/material';
import { Input } from './design-system/Input/Input';
/** チームは作問者と別に設定し、開始後は固定する。 */
export const TeamFields = ({ names, onChange, disabled = false }: { names: string[]; onChange: (names: string[]) => void; disabled?: boolean }) => (
  <Box component="fieldset" disabled={disabled} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
    <Typography variant="h6" component="legend">参加チーム・スコア管理</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>問題を作る参加者とは別です。1人でも1チームとして登録できます。開催中はスコアを表示せず、終了後に順位を発表します。開始後は変更できません。</Typography>
    <Input label="参加チーム数" type="number" fullWidth inputProps={{ min: 0, max: 50, step: 1 }} value={names.length} onChange={e => onChange(Array.from({ length: Math.min(50, Math.max(0, Math.floor(Number(e.target.value) || 0))) }, (_, i) => names[i] ?? `チーム${i + 1}`))} helperText="1〜50チーム。0にすると従来どおりスコア管理を使いません。" />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' }, gap: 2, mt: 2 }}>
      {names.map((name, i) => <Input key={i} label={`チーム${i + 1}の名前`} required fullWidth value={name} onChange={e => onChange(names.map((n, j) => j === i ? e.target.value : n))} inputProps={{ maxLength: 20 }} helperText={`${name.length}/20文字・重複不可`} />)}
    </Box>
  </Box>
);
