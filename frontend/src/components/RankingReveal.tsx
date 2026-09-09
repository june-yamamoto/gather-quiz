import { useEffect, useState } from 'react';
import { Box, Paper, Typography, useMediaQuery } from '@mui/material';
import { Button } from './design-system/Button/Button';
import type { Results } from '../api/ScoringApiClient';
/** 同順位をまとめて下位から発表し、動きを抑える設定にも対応する。 */
export const RankingReveal = ({ result }: { result: Results }) => {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const groups = [...new Set(result.rankings.map(team => team.rank))];
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setRevealed(n => Math.min(groups.length, n + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [groups.length, reduced]);
  const visible = reduced ? groups : groups.slice(Math.max(0, groups.length - revealed));
  return <Box sx={{ textAlign: 'center' }}>
    <Typography variant="overline" color="secondary">GATHERQUIZ · FINAL RESULTS</Typography>
    <Typography variant="h3" component="h1" sx={{ my: 2 }}>結果発表</Typography>
    <Typography variant="h6" sx={{ mb: 3, overflowWrap: 'anywhere' }}>{result.tournamentName}</Typography>
    {!result.rankings.length && <Typography>お疲れ様でした！この大会はスコア管理を使用していません。</Typography>}
    {!!groups.length && <Button onClick={() => setRevealed(groups.length)} disabled={reduced || revealed >= groups.length}>すべての順位を表示</Button>}
    <Box component="ol" aria-label="最終順位" sx={{ listStyle: 'none', p: 0, display: 'grid', gap: 2, mt: 3 }}>
      {result.rankings.filter(team => visible.includes(team.rank)).map(team => <Paper component="li" key={team.id} sx={{ p: 3, border: team.rank === 1 ? 3 : 1, borderColor: team.rank === 1 ? 'secondary.main' : 'divider', borderRadius: 3, animation: reduced ? 'none' : 'rankAppear 700ms ease-out both', '@keyframes rankAppear': { from: { opacity: 0, transform: 'translateY(32px) scale(0.96)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } } }}>
        <Typography color="secondary" fontWeight={800} variant="h5">{team.rank === 1 ? '🏆 ' : ''}第{team.rank}位</Typography>
        <Typography variant="h4" sx={{ my: 1, overflowWrap: 'anywhere' }}>{team.name}</Typography>
        <Typography variant="h5" fontWeight={800}>{team.score}点</Typography>
      </Paper>)}
    </Box>
  </Box>;
};
