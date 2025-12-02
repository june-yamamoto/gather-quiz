import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Grid } from '@mui/material';
import { Tournament } from '../models/Tournament';
import { Input } from './design-system/Input/Input';
import { Button } from './design-system/Button/Button';

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
  const [name, setName] = useState(tournament?.name || '');
  const [password, setPassword] = useState('');
  const [questionsPerParticipant, setQuestionsPerParticipant] = useState(tournament?.questionsPerParticipant || 3);
  const [pointValues, setPointValues] = useState<string[]>(
    tournament?.points ? tournament.points.split(',') : ['10', '20', '30']
  );
  const [regulation, setRegulation] = useState(tournament?.regulation || '');

  useEffect(() => {
    if (tournament) {
      setName(tournament.name);
      setQuestionsPerParticipant(tournament.questionsPerParticipant);
      // カンマ区切りの文字列を配列に変換、空の場合は空配列
      setPointValues(tournament.points ? tournament.points.split(',') : []);
      setRegulation(tournament.regulation || '');
    }
  }, [tournament]);

  // 問題数が変更されたら配点入力欄の数を調整する
  useEffect(() => {
    setPointValues((prev) => {
      const currentLength = prev.length;
      if (questionsPerParticipant > currentLength) {
        // 増えた分は空文字(またはデフォルト値)で埋める
        return [...prev, ...Array(questionsPerParticipant - currentLength).fill('')];
      } else if (questionsPerParticipant < currentLength) {
        // 減った分は切り捨てる
        return prev.slice(0, questionsPerParticipant);
      }
      return prev;
    });
  }, [questionsPerParticipant]);

  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...pointValues];
    newPoints[index] = value;
    setPointValues(newPoints);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData: TournamentFormData = {
      name,
      questionsPerParticipant: Number(questionsPerParticipant),
      points: pointValues.join(','),
      regulation,
      ...(password && { password }),
    };
    onSubmit(formData);
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Input label="大会名" fullWidth required value={name} onChange={(e) => setName(e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <Input
            label={isEditMode ? '管理用パスワード (変更する場合のみ入力)' : '管理用パスワード'}
            type="password"
            fullWidth
            required={!isEditMode}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Input
            label="参加者1人あたりの問題作成数"
            type="number"
            fullWidth
            required
            value={questionsPerParticipant}
            onChange={(e) => setQuestionsPerParticipant(Number(e.target.value))}
            inputProps={{ min: 1, max: 10 }}
          />
        </Grid>
        
        {/* 動的な配点入力欄 */}
        <Grid item xs={12}>
            <Grid container spacing={2}>
            {pointValues.map((point, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                <Input
                    label={`${index + 1}問目の配点`}
                    type="number"
                    fullWidth
                    required
                    value={point}
                    onChange={(e) => handlePointChange(index, e.target.value)}
                />
                </Grid>
            ))}
            </Grid>
        </Grid>

        <Grid item xs={12}>
          <Input
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
