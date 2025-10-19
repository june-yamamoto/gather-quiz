import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { TextField, Button, Container, Typography } from '@mui/material';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Form = styled('form')(({ theme }) => ({
  width: '100%', // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const TournamentCreationPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [questionsPerParticipant, setQuestionsPerParticipant] = useState(3);
  const [points, setPoints] = useState('10,20,30');
  const [regulation, setRegulation] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch('/api/tournaments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        password,
        questionsPerParticipant: Number(questionsPerParticipant),
        points,
        regulation,
      }),
    });

    if (response.ok) {
      const tournament = await response.json();
      navigate(`/tournaments/${tournament.id}/created`, { state: { password } });
    } else {
      // Handle error
      console.error('Failed to create tournament');
    }
  };

  return (
    <StyledContainer maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        新しいクイズ大会を作成
      </Typography>
      <Form onSubmit={handleSubmit}>
        <TextField
          label="大会名"
          fullWidth
          required
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="管理用パスワード"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="参加者1人あたりの問題作成数"
          type="number"
          fullWidth
          required
          margin="normal"
          value={questionsPerParticipant}
          onChange={(e) => setQuestionsPerParticipant(Number(e.target.value))}
        />
        <TextField
          label="各問題の配点 (カンマ区切り)"
          fullWidth
          required
          margin="normal"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
        />
        <TextField
          label="レギュレーション"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          value={regulation}
          onChange={(e) => setRegulation(e.target.value)}
        />
        <SubmitButton type="submit" variant="contained" color="primary" fullWidth>
          この内容で大会を作成する
        </SubmitButton>
      </Form>
    </StyledContainer>
  );
};

export default TournamentCreationPage;
