import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { pathToQuizCreator } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { Input } from '../components/design-system/Input/Input';
import { Button } from '../components/design-system/Button/Button';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

const ParticipantRegistrationPage = () => {
  const [name, setName] = useState('');
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
      alert(`「${participant.name}」として登録しました！`);
      // 登録完了後、新しく発行された参加者IDを使って問題作成ページへ遷移させる
      navigate(pathToQuizCreator(tournamentId, participant.id));
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    }
  };

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
