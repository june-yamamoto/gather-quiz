import { useState, useCallback } from 'react';
import {
  Button,
  Container,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { pathToTournamentRegisterParticipant, pathToOrganizerDashboard } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { useApi } from '../hooks/useApi';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

const TournamentPortalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');

  const fetchTournament = useCallback(() => {
    if (!id) {
      return Promise.reject(new Error('Tournament ID is not defined'));
    }
    return tournamentApiClient.get(id);
  }, [id]);

  const { data: tournament } = useApi(fetchTournament);

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
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {tournament ? `大会: ${tournament.name}` : '大会ポータル'}
      </Typography>
      <Typography variant="h6" color="textSecondary" paragraph>
        参加方法を選択してください
      </Typography>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" color="primary" size="large" onClick={handleClickOpen}>
          主催者としてログイン
        </Button>
        <Button
          component={Link}
          to={pathToTournamentRegisterParticipant(id || '')}
          variant="contained"
          color="primary"
          size="large"
        >
          参加者として新規登録
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>主催者ログイン</DialogTitle>
        <DialogContent>
          <DialogContentText>大会作成時に設定した管理用パスワードを入力してください。</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="管理用パスワード"
            type="password"
            fullWidth
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button onClick={handleLogin}>ログイン</Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default TournamentPortalPage;
