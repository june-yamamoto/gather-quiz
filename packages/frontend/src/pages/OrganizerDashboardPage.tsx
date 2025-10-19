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

// Mock data for now
const mockParticipants = [
  { id: '1', name: 'Tanaka', created: 5, required: 5 },
  { id: '2', name: 'Sato', created: 3, required: 5 },
  { id: '3', name: 'Suzuki', created: 0, required: 5 },
];

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

  // TODO: Replace with API call
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [participants, setParticipants] = useState(mockParticipants);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tournamentName, setTournamentName] = useState('〇〇〇〇クイズ大会');

  useEffect(() => {
    // This will be used to fetch data from the API
  }, []);

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
