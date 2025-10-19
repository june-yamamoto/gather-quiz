import { useState } from 'react';
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

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

const TournamentPortalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');

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
          navigate(`/tournaments/${id}/admin`);
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
        大会ポータル
      </Typography>
      <Typography variant="h6" color="textSecondary" paragraph>
        参加方法を選択してください
      </Typography>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" color="primary" size="large" onClick={handleClickOpen}>
          主催者としてログイン
        </Button>
        <Button component={Link} to={`/tournaments/${id}/register`} variant="contained" color="primary" size="large">
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
