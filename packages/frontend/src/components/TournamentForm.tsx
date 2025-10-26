import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { TextField, Button, Grid } from '@mui/material';
import { Tournament } from '../models/Tournament';

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(3),
}));

const StyledSubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

export type TournamentFormData = {
  name: string;
  questionsPerParticipant: number;
  points: string;
  regulation: string;
  password?: string;
};

type TournamentFormProps = {
  tournament?: Tournament;
  onSubmit: (formData: TournamentFormData) => void;
  isEditMode: boolean;
};

export const TournamentForm = ({ tournament, onSubmit, isEditMode }: TournamentFormProps) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [questionsPerParticipant, setQuestionsPerParticipant] = useState(3);
  const [points, setPoints] = useState('10,20,30');
  const [regulation, setRegulation] = useState('');

  useEffect(() => {
    if (tournament) {
      setName(tournament.name);
      setQuestionsPerParticipant(tournament.questionsPerParticipant);
      setPoints(tournament.points);
      setRegulation(tournament.regulation || '');
    }
  }, [tournament]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData: TournamentFormData = {
      name,
      questionsPerParticipant: Number(questionsPerParticipant),
      points,
      regulation,
      ...(password && { password }),
    };
    onSubmit(formData);
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="大会名"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={isEditMode ? '管理用パスワード (変更する場合のみ入力)' : '管理用パスワード'}
            type="password"
            fullWidth
            required={!isEditMode}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="参加者1人あたりの問題作成数"
            type="number"
            fullWidth
            required
            value={questionsPerParticipant}
            onChange={(e) => setQuestionsPerParticipant(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="各問題の配点 (カンマ区切り)"
            fullWidth
            required
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="レギュレーション"
            multiline
            rows={4}
            fullWidth
            value={regulation}
            onChange={(e) => setRegulation(e.target.value)}
          />
        </Grid>
      </Grid>
      <StyledSubmitButton type="submit" variant="contained" color="primary" fullWidth>
        {isEditMode ? 'この内容で更新する' : 'この内容で大会を作成する'}
      </StyledSubmitButton>
    </StyledForm>
  );
};
