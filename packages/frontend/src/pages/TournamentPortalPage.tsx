import { useState, useEffect } from 'react';
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
import { Tournament } from '../models/Tournament';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

const TournamentPortalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchTournament = async () => {
      try {
        const response = await fetch(`/api/tournaments/${id}`);
        if (response.ok) {
          const data = await response.json();
          setTournament(Tournament.fromApi(data));
        } else {
          // ここでエラーページに遷移させるなどの処理も考えられる
          console.error('Failed to fetch tournament');
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchTournament();
  }, [id]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPassword('');
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        handleClose();
        setTimeout(() => {
          navigate(pathToOrganizerDashboard(id || ''));
        }, 0);
      } else {
        alert('パスワードが違います。');
        setPassword('');
      }
    } catch (error) {
      console.error(error);
      alert('ログイン中にエラーが発生しました。');
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
