import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const { tournamentId } = useParams();
  const isEditMode = !!tournamentId;

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [questionsPerParticipant, setQuestionsPerParticipant] = useState(3);
  const [points, setPoints] = useState('10,20,30');
  const [regulation, setRegulation] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchTournament = async () => {
        try {
          const response = await fetch(`/api/tournaments/${tournamentId}`);
          if (response.ok) {
            const data = await response.json();
            setName(data.name);
            // Password is not fetched for security reasons
            setQuestionsPerParticipant(data.questionsPerParticipant);
            setPoints(data.points);
            setRegulation(data.regulation || '');
          } else {
            throw new Error('Failed to fetch tournament data');
          }
        } catch (error) {
          console.error(error);
          alert('大会情報の取得に失敗しました。');
        }
      };
      fetchTournament();
    }
  }, [isEditMode, tournamentId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const url = isEditMode ? `/api/tournaments/${tournamentId}` : '/api/tournaments';
    const method = isEditMode ? 'PUT' : 'POST';

    const body = {
      name,
      questionsPerParticipant: Number(questionsPerParticipant),
      points,
      regulation,
      // Only include password if it's not edit mode or if it has been changed
      ...(password && { password }),
    };

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const tournament = await response.json();
      if (isEditMode) {
        alert('大会情報が更新されました。');
        navigate(`/tournaments/${tournament.id}/admin`);
      } else {
        navigate(`/tournaments/${tournament.id}/created`, { state: { password } });
      }
    } else {
      alert(isEditMode ? '更新に失敗しました。' : '作成に失敗しました。');
    }
  };

  return (
    <StyledContainer maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? '大会概要を編集' : '新しいクイズ大会を作成'}
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
          label={isEditMode ? '管理用パスワード (変更する場合のみ入力)' : '管理用パスワード'}
          type="password"
          fullWidth
          required={!isEditMode}
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
          {isEditMode ? 'この内容で更新する' : 'この内容で大会を作成する'}
        </SubmitButton>
      </Form>
    </StyledContainer>
  );
};

export default TournamentCreationPage;
