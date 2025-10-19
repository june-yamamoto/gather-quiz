import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface ParticipantStatus {
  id: string;
  name: string;
  created: number;
  required: number;
}

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const OrganizerDashboardPage = () => {
  const { tournamentId } = useParams();
  const portalUrl = `${window.location.origin}/tournaments/${tournamentId}`;

  const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
  const [tournamentName, setTournamentName] = useState('');

  useEffect(() => {
    if (!tournamentId) return;

    const fetchTournamentStatus = async () => {
      try {
        const response = await fetch(`/api/tournaments/${tournamentId}/status`);
        if (!response.ok) {
          throw new Error('Failed to fetch tournament status');
        }
        const data = await response.json();
        setTournamentName(data.tournamentName);
        setParticipants(data.participants);
      } catch (error) {
        console.error(error);
        // TODO: Handle error display in UI
      }
    };

    fetchTournamentStatus();
  }, [tournamentId]);

  const handleStartTournament = () => {
    // TODO: Implement start tournament logic
    alert('大会を開始します！（仮）');
  };

  return (
    <StyledContainer maxWidth="lg">
      <HeaderPaper elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          管理ページ: {tournamentName}
        </Typography>
        <Box>
          <Typography variant="subtitle1">招待URL</Typography>
          <Typography variant="body2" color="text.secondary">
            {portalUrl}
          </Typography>
        </Box>
      </HeaderPaper>

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
            {participants.map((p) => (
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
