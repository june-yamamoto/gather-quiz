import { Box, Chip, Grid, List, ListItem, Stack, Typography } from '@mui/material';
import type { Tournament } from '../models/Tournament';
import { Card } from './design-system/Card/Card';

type TournamentOverviewProps = { tournament: Tournament; participantCount?: number; participantCountError?: boolean };

/** 参加前に必要な大会設定を、投稿済みの問題や個人情報を含めずに表示する。 */
export const TournamentOverview = ({ tournament, participantCount, participantCountError = false }: TournamentOverviewProps) => {
  const genres = tournament.genres?.split(',').map(genre => genre.trim()).filter(Boolean) || [];
  const status = { preparing: '準備中', pending: '準備中', in_progress: '開催中', finished: '終了' }[tournament.status];

  return (
    <Card component="section" aria-labelledby="tournament-overview-title" sx={{ my: 3, textAlign: 'left', height: 'auto', overflowWrap: 'anywhere' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography id="tournament-overview-title" variant="h5" component="h2">大会概要</Typography>
        {status && <Chip label={status} size="small" variant="outlined" />}
      </Stack>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography color="text.secondary">現在の参加人数</Typography>
          <Typography variant="h5" component="p">{participantCountError ? '取得できませんでした' : participantCount === undefined ? '確認中…' : `${participantCount}人`}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography color="text.secondary">作成する問題数</Typography>
          <Typography variant="h5" component="p">1人あたり{tournament.questionsPerParticipant}問</Typography>
        </Grid>
      </Grid>
      <Typography variant="h6" component="h3">作成する問題の概要</Typography>
      <Typography variant="body2" color="text.secondary">各参加者は、以下の内容で問題を作成してください。</Typography>
      <List aria-label="作成する問題の概要" sx={{ mb: 2 }}>
        {tournament.points.split(',').map((point, index) => {
          const slot = tournament.questionSlots[index];
          const format = slot?.questionType === 'normal' ? '通常問題' : slot?.questionType === 'choice' ? '選択問題' : '参加者が出題形式を選択';
          return (
            <ListItem key={index} divider sx={{ px: 0, display: 'block' }}>
              <Typography fontWeight="bold">第{index + 1}問 · {slot?.label.trim() || '概要は未設定'}</Typography>
              <Typography variant="body2" color="text.secondary">{point.trim()}点 · {format}</Typography>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom>ジャンル</Typography>
        {genres.length ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {genres.map((genre, index) => <Chip key={index} label={genre} sx={{ maxWidth: '100%', height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } }} />)}
        </Box> : <Typography color="text.secondary">ジャンルは指定されていません。</Typography>}
      </Box>
      <Box>
        <Typography variant="h6" component="h3" gutterBottom>レギュレーション</Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{tournament.regulation?.trim() || 'レギュレーションは設定されていません。'}</Typography>
      </Box>
    </Card>
  );
};
