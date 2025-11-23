import { useState } from 'react';
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
import { pathToTournamentRegisterParticipant, pathToOrganizerDashboard } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { Button } from '../components/design-system/Button/Button';
import { Input } from '../components/design-system/Input/Input';
import { Card } from '../components/design-system/Card/Card';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

const TournamentPortalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');

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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPassword('');
  };

  const handleLogin = async () => {
    if (!id) return;
    try {
      await tournamentApiClient.login(id, password);
      handleClose();
      setTimeout(() => {
        navigate(pathToOrganizerDashboard(id));
      }, 0);
    } catch (error) {
      console.error(error);
      alert('パスワードが違います。');
      setPassword('');
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
              <Button variant="outlined" color="primary" size="large" onClick={handleClickOpen} fullWidth>
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
            <Box sx={{ mt: 3 }}>
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
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>主催者ログイン</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>大会作成時に設定した管理用パスワードを入力してください。</DialogContentText>
          <Input
            autoFocus
            margin="dense"
            id="password"
            label="管理用パスワード"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 24px' }}>
          <Button onClick={handleClose} variant="outlined">
            キャンセル
          </Button>
          <Button onClick={handleLogin} variant="contained">
            ログイン
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default TournamentPortalPage;
