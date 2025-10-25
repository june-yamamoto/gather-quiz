import { useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { pathToTournamentEdit, pathToQuizBoard } from '../helpers/route-helpers';
import { useApi } from '../hooks/useApi';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledHeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const OrganizerDashboardPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const portalUrl = `${window.location.origin}/tournaments/${tournamentId}`;

  const fetchTournamentStatus = useCallback(() => {
    if (!tournamentId) {
      return Promise.reject(new Error('Tournament ID is not defined'));
    }
    return tournamentApiClient.getStatus(tournamentId);
  }, [tournamentId]);

  const { data: status, error, isLoading } = useApi(fetchTournamentStatus);

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
      <StyledHeaderPaper elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          管理ページ: {status?.tournamentName}
        </Typography>
        <Box>
          <Typography variant="subtitle1">招待URL</Typography>
          <Typography variant="body2" color="text.secondary">
            {portalUrl}
          </Typography>
        </Box>

        <Button component={Link} to={pathToTournamentEdit(tournamentId || '')} variant="outlined" sx={{ mt: 2 }}>
          大会概要を編集する
        </Button>
      </StyledHeaderPaper>

      <Typography variant="h5" component="h2" gutterBottom>
        参加者の問題作成状況
      </Typography>
      <TableContainer component={Paper}>
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
