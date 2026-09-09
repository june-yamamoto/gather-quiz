import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Alert } from '@mui/material';
import { TeamFields } from '../components/TeamFields';
import { Container, Typography, Box, TableHead, TableRow, TableCell, TableBody, CircularProgress, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { pathToTournamentEdit, pathToQuizBoard, pathToTournamentPortal } from '../helpers/route-helpers';
import { Button } from '../components/design-system/Button/Button';
import { Card } from '../components/design-system/Card/Card';
import { Table, TableContainer } from '../components/design-system/Table/Table';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const OrganizerDashboardPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [teamNames, setTeamNames] = useState<string[] | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const portalUrl = `${window.location.origin}/tournaments/${tournamentId}`;

  const {
    data: status,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['tournament', tournamentId, 'status'],
    queryFn: () => {
      if (!tournamentId) {
        throw new Error('Tournament ID is not defined');
      }
      return tournamentApiClient.getStatus(tournamentId);
    },
    enabled: !!tournamentId, // tournamentId が存在する場合のみクエリを実行
  });

  /** チーム設定と開始を一度に保存し、失敗時には入力を保持する。 */
  const handleStartTournament = async () => {
    if (!tournamentId || starting) return;
    setStarting(true);
    setStartError('');
    try {
      await tournamentApiClient.start(tournamentId, teamNames ?? status?.teams?.map(team => team.name) ?? []);
      navigate(pathToQuizBoard(tournamentId));
    } catch (error) {
      setStartError(error instanceof Error && error.message ? error.message : '大会の開始に失敗しました。');
    } finally {
      setStarting(false);
    }
  };

  const isStarted = status?.status === 'in_progress' || status?.status === 'finished';

  if (isLoading) {
    return (
      <StyledContainer maxWidth="lg" sx={{ textAlign: 'center' }}>
        <CircularProgress />
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer maxWidth="lg">
        <Typography color="error">エラー: {error.message}</Typography>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mr: 2 }}>
          管理ページ: {status?.tournamentName}
        </Typography>
        {isStarted && <Chip label="開始済み" color="success" />}
      </Box>

      <Card sx={{ mb: 3, textAlign: 'left' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          大会情報
        </Typography>
        <Box>
          <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
            招待URL
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {portalUrl}
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          {isStarted && <Typography sx={{ mb: 2 }}>参加チーム：{status?.teams?.map(team => team.name).join('、') || 'スコア管理なし'}</Typography>}
          <Button component={Link} to={pathToTournamentEdit(tournamentId || '')} variant="outlined">
            大会概要を編集する
          </Button>
        </Box>
      </Card>

      <Typography variant="h5" component="h2" gutterBottom>
        参加者の問題作成状況
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>参加者名</TableCell>
              <TableCell align="right">作成状況</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {status?.participants.map((p) => (
              <TableRow key={p.id}>
                <TableCell component="th" scope="row">
                  {p.name}
                </TableCell>
                <TableCell align="right">{`${p.created} / ${p.required} 問`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box component="form" onSubmit={event => { event.preventDefault(); void handleStartTournament(); }} sx={{ mt: 3, textAlign: 'center' }}>
        {!isStarted && <Card sx={{ mb: 3, textAlign: 'left' }}>
          <Typography sx={{ mb: 2 }}>大会を開始する前に、当日の参加チームを設定してください。開始ボタンで確定します。</Typography>
          <TeamFields names={teamNames ?? status?.teams?.map(team => team.name) ?? []} onChange={setTeamNames} disabled={starting} />
        </Card>}
        {startError && <Alert severity="error" sx={{ mb: 2 }}>{startError}</Alert>}
        {isStarted ? (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={Link}
            to={pathToQuizBoard(tournamentId || '')}
          >
             問題ボードへ移動する
          </Button>
        ) : (
          <Button variant="contained" color="primary" size="large" type="submit" disabled={starting}>
            この内容で大会を開始する
          </Button>
        )}
        {!isStarted && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            一度開始すると、問題の編集や参加者の追加はできなくなります。
          </Typography>
        )}
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          component={Link}
          to={pathToTournamentPortal(tournamentId || '')}
          variant="outlined"
          color="inherit"
        >
          大会ポータルへ戻る
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default OrganizerDashboardPage;
