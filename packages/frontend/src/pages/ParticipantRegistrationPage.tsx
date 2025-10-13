import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

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
    if (!name.trim()) {
      alert('名前を入力してください。');
      return;
    }

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('参加者登録に失敗しました。');
      }

      const participant = await response.json();
      alert(`「${participant.name}」として登録しました！`);
      // Navigate to the next step, e.g., quiz creation page
      // For now, just navigate back to the portal
      navigate(`/tournaments/${tournamentId}`);
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
        <TextField
          label="あなたの名前"
          variant="outlined"
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