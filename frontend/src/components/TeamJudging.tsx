import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { scoringApiClient, type JudgmentState } from '../api/ScoringApiClient';
import { Button } from './design-system/Button/Button';
import type { Quiz } from '../models/Quiz';
/** 判定のみを編集し、開催中の合計点や順位は取得・表示しない。 */
export const TeamJudging = ({ quiz, open, onClose, onSaved }: { quiz: Quiz; open: boolean; onClose: () => void; onSaved: () => void }) => {
  const [state, setState] = useState<JudgmentState | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    let cancelled = false; setState(null); setError('');
    scoringApiClient.reveal(quiz.tournamentId, quiz.id).then(data => { if (!cancelled) setState(data); }).catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : '取得に失敗しました。'); });
    return () => { cancelled = true; };
  }, [open, quiz.id, quiz.tournamentId, attempt]);
  /** 保存に成功するまで判定を画面に保持する。 */
  const save = async () => {
    if (!state || saving) return;
    setSaving(true); setError('');
    try { await scoringApiClient.save(quiz.tournamentId, quiz.id, state.judgments); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : '保存に失敗しました。'); }
    finally { setSaving(false); }
  };
  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>この問題のチーム別正誤</DialogTitle>
    <DialogContent>
      {error && <Alert severity="error" action={!state && <Button onClick={() => setAttempt(n => n + 1)}>再試行</Button>}>{error}</Alert>}
      {!state && !error && <CircularProgress />}
      {state && !state.canJudge && <Typography>この大会は現在、判定を変更できません。</Typography>}
      {state?.canJudge && <Box component="fieldset" disabled={saving} sx={{ border: 0, p: 0, m: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>全チームの正解・不正解を選んで保存してください。再保存するとこの問題の判定を置き換えます。</Typography>
        {state.teams.map(team => <Box key={team.id} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
          <Typography id={`team-${team.id}`} fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{team.name}</Typography>
          <RadioGroup row aria-labelledby={`team-${team.id}`} value={state.judgments[team.id] === undefined ? '' : String(state.judgments[team.id])} onChange={e => setState({ ...state, judgments: { ...state.judgments, [team.id]: e.target.value === 'true' } })}>
            <FormControlLabel value="true" control={<Radio />} label="正解" /><FormControlLabel value="false" control={<Radio />} label="不正解" />
          </RadioGroup>
        </Box>)}
      </Box>}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={saving}>解答に戻る</Button>
      {state?.canJudge ? <Button variant="contained" onClick={save} disabled={saving || state.teams.some(team => state.judgments[team.id] === undefined)}>正誤を保存してボードへ</Button> : state && <Button onClick={onSaved}>ボードに戻る</Button>}
    </DialogActions>
  </Dialog>;
};
