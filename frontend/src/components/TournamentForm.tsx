import { TeamFields } from './TeamFields';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Box, Typography, MenuItem } from '@mui/material';
import type { QuestionSlot } from '../models/QuestionSlot';
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
  questionSlots: QuestionSlot[];
  regulation: string;
  genres: string;
  teamNames: string[];
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
  const [genres, setGenres] = useState(tournament?.genres || '');
  const [teamNames, setTeamNames] = useState<string[]>(tournament?.teams?.map(team => team.name) || []);
  const [slots, setSlots] = useState<QuestionSlot[]>(tournament?.questionSlots || []);

  useEffect(() => {
    if (tournament) {
      setName(tournament.name);
      setTeamNames(tournament.teams.map(team => team.name));
      setSlots(tournament.questionSlots);
      setQuestionsPerParticipant(tournament.questionsPerParticipant);
      // カンマ区切りの文字列を配列に変換、空の場合は空配列
      setPointValues(tournament.points ? tournament.points.split(',') : []);
      setRegulation(tournament.regulation || '');
      setGenres(tournament.genres || '');
    }
  }, [tournament]);

  // 問題数が変更されたら配点入力欄の数を調整する
  useEffect(() => {
    if (!Number.isInteger(questionsPerParticipant) || questionsPerParticipant < 1 || questionsPerParticipant > 10) return;
    setSlots(prev => Array.from({ length: questionsPerParticipant }, (_, index) => prev[index] || { label: '', choiceCount: 0, questionType: 'normal' }));
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

  /** 問題数の変更後も同じ順序の設定を保持する。 */
  const updateSlot = (index: number, patch: Partial<QuestionSlot>) => {
    setSlots(prev => prev.map((slot, i) => i === index ? { ...slot, ...patch } : slot));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData: TournamentFormData = {
      name,
      questionsPerParticipant: Number(questionsPerParticipant),
      points: pointValues.join(','),
      questionSlots: pointValues.map((_, i) => ({ ...slots[i], label: (slots[i]?.label || '').trim(), choiceCount: slots[i]?.choiceCount || 0 })),
      regulation,
      genres,
      teamNames,
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
        
        <Grid item xs={12}><TeamFields names={teamNames} onChange={setTeamNames} disabled={!!tournament && tournament.status !== 'pending'} /></Grid>
        {/* 配点が同じでも問題順ごとに別の枠として設定する。 */}
        <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>参加者に割り当てる問題</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>ラベルは任意です。通常問題／選択問題を指定してください。選択肢数（2〜20択）は参加者が問題作成時に決めます。</Typography>
            {isEditMode && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>問題が作成された大会では、問題数・配点・ラベル・出題形式は変更できません。</Typography>}
            <Grid container spacing={2}>
            {pointValues.map((point, index) => (
                <Grid item xs={12} key={index}>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
                <Typography fontWeight="bold" sx={{ mb: 2 }}>第{index + 1}問</Typography>
                <Grid container spacing={2}>
                <Grid item xs={12} sm={7}>
                  <Input label={`${index + 1}問目のラベル`} placeholder="例: 声優、音楽" fullWidth value={slots[index]?.label || ''} inputProps={{ maxLength: 50 }} onChange={e => updateSlot(index, { label: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={5}>
                <Input
                    label={`${index + 1}問目の配点`}
                    type="number"
                    fullWidth
                    required
                    value={point}
                    inputProps={{ min: 1, max: 2147483647, step: 1 }}
                    onChange={(e) => handlePointChange(index, e.target.value)}
                />
                </Grid>
                <Grid item xs={12}>
                  <Input select label={`${index + 1}問目の出題形式`} fullWidth value={slots[index]?.questionType || 'legacy'} onChange={e => updateSlot(index, { questionType: e.target.value as 'normal' | 'choice' })}>
                    {!slots[index]?.questionType && <MenuItem value="legacy">従来設定（参加者が形式選択）</MenuItem>}
                    <MenuItem value="normal">通常問題</MenuItem><MenuItem value="choice">選択問題</MenuItem>
                  </Input>
                </Grid>
                </Grid>
                </Box>
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
        <Grid item xs={12}>
          <Input
            label="ジャンル設定 (カンマ区切り)"
            placeholder="例: スポーツ, アニメ, 科学"
            fullWidth
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            helperText="設定したジャンルは、問題作成時に選択できるようになります。空欄の場合はジャンル設定なしとなります。"
          />
        </Grid>
      </Grid>
      <StyledSubmitButton type="submit" variant="contained" color="primary" fullWidth>
        {isEditMode ? 'この内容で更新する' : 'この内容で大会を作成する'}
      </StyledSubmitButton>
    </StyledForm>
  );
};
