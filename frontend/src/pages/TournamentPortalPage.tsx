import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pathToTournamentRegisterParticipant, pathToOrganizerDashboard, pathToParticipantDashboard } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { Button } from '../components/design-system/Button/Button';
import { Input } from '../components/design-system/Input/Input';
import { Card } from '../components/design-system/Card/Card';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

type ViewedTournament = {
  id: string;
  name: string;
  lastViewed: number;
};

const TournamentPortalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Organizer Login State
  const [organizerLoginOpen, setOrganizerLoginOpen] = useState(false);
  const [organizerPassword, setOrganizerPassword] = useState('');

  // Participant Login State
  const [participantLoginOpen, setParticipantLoginOpen] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [participantPassword, setParticipantPassword] = useState('');

  const { data: tournament } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Tournament ID is not defined');
      }
      return tournamentApiClient.get(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (tournament && id) {
      const viewedTournaments: ViewedTournament[] = JSON.parse(localStorage.getItem('viewedTournaments') || '[]');
      const newEntry = { id, name: tournament.name, lastViewed: Date.now() };
      
      // Remove existing entry with same ID
      const filtered = viewedTournaments.filter((t) => t.id !== id);
      
      // Add new entry to the beginning
      const updated = [newEntry, ...filtered].slice(0, 5); // Keep max 5
      
      localStorage.setItem('viewedTournaments', JSON.stringify(updated));
    }
  }, [tournament, id]);

  // Organizer Handlers
  const handleOrganizerLoginOpen = () => {
    setOrganizerLoginOpen(true);
  };

  const handleOrganizerLoginClose = () => {
    setOrganizerLoginOpen(false);
    setOrganizerPassword('');
  };

  const handleOrganizerLogin = async () => {
    if (!id) return;
    try {
      await tournamentApiClient.login(id, organizerPassword);
      handleOrganizerLoginClose();
      setTimeout(() => {
        navigate(pathToOrganizerDashboard(id));
      }, 0);
    } catch (error) {
      console.error(error);
      alert('パスワードが違います。');
      setOrganizerPassword('');
    }
  };

  // Participant Handlers
  const handleParticipantLoginOpen = () => {
    setParticipantLoginOpen(true);
  };

  const handleParticipantLoginClose = () => {
    setParticipantLoginOpen(false);
    setParticipantName('');
    setParticipantPassword('');
  };

  const handleParticipantLogin = async () => {
    if (!id) return;
    try {
      const participant = await tournamentApiClient.loginParticipant(id, participantName, participantPassword);
      handleParticipantLoginClose();
      setTimeout(() => {
        navigate(pathToParticipantDashboard(id, participant.id));
      }, 0);
    } catch (error) {
      console.error(error);
      alert('名前またはパスワードが違います。');
    }
  };

  return (
    <StyledContainer maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        {tournament ? `大会: ${tournament.name}` : '大会ポータル'}
      </Typography>
      <Typography variant="h6" color="textSecondary" paragraph>
        参加方法を選択してください
      </Typography>
      <Grid container spacing={4} sx={{ mt: 4 }} justifyContent="center">
        <Grid item xs={12} sm={6} md={5}>
          <Card>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                主催者の方
              </Typography>
              <Typography color="textSecondary">大会の管理や進行はこちらから</Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button variant="outlined" color="primary" size="large" onClick={handleOrganizerLoginOpen} fullWidth>
                主催者としてログイン
              </Button>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={5}>
          <Card>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                参加者の方
              </Typography>
              <Typography color="textSecondary">問題の作成や確認はこちらから</Typography>
            </Box>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                component={Link}
                to={pathToTournamentRegisterParticipant(id || '')}
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                参加者として新規登録
              </Button>
              <Button variant="outlined" color="primary" size="large" onClick={handleParticipantLoginOpen} fullWidth>
                参加者としてログイン
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Organizer Login Dialog */}
      <Dialog open={organizerLoginOpen} onClose={handleOrganizerLoginClose} maxWidth="xs" fullWidth>
        <DialogTitle>主催者ログイン</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>大会作成時に設定した管理用パスワードを入力してください。</DialogContentText>
          <Input
            autoFocus
            margin="dense"
            label="管理用パスワード"
            type="password"
            fullWidth
            value={organizerPassword}
            onChange={(e) => setOrganizerPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleOrganizerLogin()}
          />
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 24px' }}>
          <Button onClick={handleOrganizerLoginClose} variant="outlined">
            キャンセル
          </Button>
          <Button onClick={handleOrganizerLogin} variant="contained">
            ログイン
          </Button>
        </DialogActions>
      </Dialog>

      {/* Participant Login Dialog */}
      <Dialog open={participantLoginOpen} onClose={handleParticipantLoginClose} maxWidth="xs" fullWidth>
        <DialogTitle>参加者ログイン</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>登録した名前とパスワードを入力してください。</DialogContentText>
          <Input
            autoFocus
            margin="dense"
            label="名前"
            fullWidth
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Input
            margin="dense"
            label="パスワード"
            type="password"
            fullWidth
            value={participantPassword}
            onChange={(e) => setParticipantPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleParticipantLogin()}
          />
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 24px' }}>
          <Button onClick={handleParticipantLoginClose} variant="outlined">
            キャンセル
          </Button>
          <Button onClick={handleParticipantLogin} variant="contained">
            ログイン
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default TournamentPortalPage;
