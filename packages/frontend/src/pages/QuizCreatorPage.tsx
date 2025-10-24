import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { TextField, Button, Container, Typography, Box, Grid } from '@mui/material';
import { pathToParticipantDashboard } from '../helpers/route-helpers';
import { Quiz } from '../models/Quiz';
import { uploadApiClient } from '../api/UploadApiClient';
import { quizApiClient } from '../api/QuizApiClient';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const QuizCreatorPage = () => {
  const navigate = useNavigate();
  const { tournamentId, participantId } = useParams();

  const [point, setPoint] = useState(10);
  const [questionText, setQuestionText] = useState('');
  const [questionLink, setQuestionLink] = useState('');
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerLink, setAnswerLink] = useState('');
  const [answerImageFile, setAnswerImageFile] = useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const questionImageUrl = questionImageFile ? await uploadApiClient.uploadImage(questionImageFile) : null;
      if (questionImageFile && !questionImageUrl) return;

      const answerImageUrl = answerImageFile ? await uploadApiClient.uploadImage(answerImageFile) : null;
      if (answerImageFile && !answerImageUrl) return;

      const quiz = new Quiz({
        id: '', // New quiz, so no ID yet
        point,
        questionText,
        questionImage: questionImageUrl,
        questionLink,
        answerText,
        answerImage: answerImageUrl,
        answerLink,
        tournamentId: tournamentId || '',
        participantId: participantId || '',
      });

      await quizApiClient.create(quiz.toApi());

      alert('問題が作成されました！');
      navigate(pathToParticipantDashboard(tournamentId || '', participantId || ''));
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    }
  };

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        問題作成・編集
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          label="配点"
          variant="outlined"
          type="number"
          required
          value={point}
          onChange={(e) => setPoint(Number(e.target.value))}
          sx={{ mb: 3, width: '150px' }}
        />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Section>
              <Typography variant="h6" gutterBottom>
                問題の作成
              </Typography>
              <TextField
                label="問題文"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                添付画像を選択
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setQuestionImageFile(e.target.files ? e.target.files[0] : null)}
                />
              </Button>
              {questionImageFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  選択中のファイル: {questionImageFile.name}
                </Typography>
              )}
              <TextField
                label="参考リンク"
                variant="outlined"
                fullWidth
                value={questionLink}
                onChange={(e) => setQuestionLink(e.target.value)}
              />
            </Section>
          </Grid>
          <Grid item xs={12} md={6}>
            <Section>
              <Typography variant="h6" gutterBottom>
                解答の作成
              </Typography>
              <TextField
                label="解答文"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                添付画像を選択
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setAnswerImageFile(e.target.files ? e.target.files[0] : null)}
                />
              </Button>
              {answerImageFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  選択中のファイル: {answerImageFile.name}
                </Typography>
              )}
              <TextField
                label="参考リンク"
                variant="outlined"
                fullWidth
                value={answerLink}
                onChange={(e) => setAnswerLink(e.target.value)}
              />
            </Section>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button type="submit" variant="contained" color="primary" size="large">
            この内容で問題を保存する
          </Button>
        </Box>
      </Box>
    </StyledContainer>
  );
};

export default QuizCreatorPage;
