import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { pathToOrganizerDashboard, pathToTournamentCreationComplete } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const StyledSubmitButton = styled(Button)(({ theme }) => ({
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

  const { data: tournamentData } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => {
      if (!tournamentId) {
        throw new Error('Tournament ID is not defined');
      }
      return tournamentApiClient.get(tournamentId);
    },
    enabled: isEditMode && !!tournamentId,
  });

  useEffect(() => {
    if (tournamentData) {
      setName(tournamentData.name);
      setQuestionsPerParticipant(tournamentData.questionsPerParticipant);
      setPoints(tournamentData.points);
      setRegulation(tournamentData.regulation || '');
    }
  }, [tournamentData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const body = {
      name,
      questionsPerParticipant: Number(questionsPerParticipant),
      points,
      regulation,
      ...(password && { password }),
    };

    try {
      if (isEditMode && tournamentId) {
        const tournament = await tournamentApiClient.update(tournamentId, body);
        alert('大会情報が更新されました。');
        navigate(pathToOrganizerDashboard(tournament.id));
      } else {
        const tournament = await tournamentApiClient.create(body);
        navigate(pathToTournamentCreationComplete(tournament.id), {
          state: { password },
        });
      }
    } catch (error) {
      console.error(error);
      alert(isEditMode ? '更新に失敗しました。' : '作成に失敗しました。');
    }
  };

  return (
    <StyledContainer maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? '大会概要を編集' : '新しいクイズ大会を作成'}
      </Typography>
      <StyledForm onSubmit={handleSubmit}>
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
        <StyledSubmitButton type="submit" variant="contained" color="primary" fullWidth>
          {isEditMode ? 'この内容で更新する' : 'この内容で大会を作成する'}
        </StyledSubmitButton>
      </StyledForm>
    </StyledContainer>
  );
};

export default TournamentCreationPage;
