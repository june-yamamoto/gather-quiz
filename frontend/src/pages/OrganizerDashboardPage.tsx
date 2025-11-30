import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { pathToTournamentEdit, pathToQuizBoard } from '../helpers/route-helpers';
import { Button } from '../components/design-system/Button/Button';
import { Card } from '../components/design-system/Card/Card';
import { Table, TableContainer } from '../components/design-system/Table/Table';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const OrganizerDashboardPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
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

  const handleStartTournament = async () => {
    if (!tournamentId) return;
    try {
      await tournamentApiClient.start(tournamentId);
      navigate(pathToQuizBoard(tournamentId));
    } catch (error) {
      console.error(error);
      alert('大会の開始に失敗しました。');
    }
  };

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
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        管理ページ: {status?.tournamentName}
      </Typography>

      <Card sx={{ mb: 4, textAlign: 'left' }}>
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

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button variant="contained" color="primary" size="large" onClick={handleStartTournament}>
          この内容で大会を開始する
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          一度開始すると、問題の編集や参加者の追加はできなくなります。
        </Typography>
      </Box>
    </StyledContainer>
  );
};

export default OrganizerDashboardPage;
