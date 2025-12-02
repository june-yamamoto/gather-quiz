import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { pathToParticipantDashboard } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { Input } from '../components/design-system/Input/Input';
import { Button } from '../components/design-system/Button/Button';
import { ApiError } from '../errors/ApiError';
import { Participant } from '../models/Participant';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

const PasswordBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
  textAlign: 'center',
}));

const ParticipantRegistrationPage = () => {
  const [name, setName] = useState('');
  const [createdParticipant, setCreatedParticipant] = useState<Participant | null>(null);
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !tournamentId) {
      alert('名前を入力してください。');
      return;
    }

    try {
      const participant = await tournamentApiClient.createParticipant(tournamentId, { name });
      setCreatedParticipant(participant);
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError && error.status === 409) {
        alert('その名前は既に使用されています。別の名前を入力してください。');
      } else {
        alert('エラーが発生しました。');
      }
    }
  };

  const handleGoToDashboard = () => {
    if (!tournamentId || !createdParticipant) return;
    navigate(pathToParticipantDashboard(tournamentId, createdParticipant.id));
  };

  if (createdParticipant) {
    return (
      <StyledContainer maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom>
          登録完了！
        </Typography>
        <Typography variant="body1" paragraph>
          参加者登録が完了しました。以下のパスワードは再ログイン時に必要になりますので、必ず控えておいてください。
        </Typography>
        <PasswordBox>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            あなたのパスワード
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', letterSpacing: '0.1em' }}>
            {createdParticipant.password}
          </Typography>
        </PasswordBox>
        <Button variant="contained" color="primary" size="large" fullWidth onClick={handleGoToDashboard}>
          ダッシュボードへ移動する
        </Button>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        参加者登録
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Input
          label="あなたの名前"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
          この名前で参加する
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default ParticipantRegistrationPage;
