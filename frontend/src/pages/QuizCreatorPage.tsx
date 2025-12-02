import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Container, Typography, Box, Grid, CircularProgress } from '@mui/material';
import { pathToParticipantDashboard } from '../helpers/route-helpers';
import { uploadApiClient } from '../api/UploadApiClient';
import { quizApiClient } from '../api/QuizApiClient';
import { Input } from '../components/design-system/Input/Input';
import { Button } from '../components/design-system/Button/Button';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const QuizCreatorPage = () => {
  const navigate = useNavigate();
  const { tournamentId, participantId } = useParams();
  const [searchParams] = useSearchParams();

  const editQuizId = searchParams.get('edit');
  const initialPoint = Number(searchParams.get('point')) || 0;
  const order = Number(searchParams.get('order')) || 0;

  const [isLoading, setIsLoading] = useState(false);
  const [point, setPoint] = useState(initialPoint);
  const [questionText, setQuestionText] = useState('');
  const [questionLink, setQuestionLink] = useState('');
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [existingQuestionImageUrl, setExistingQuestionImageUrl] = useState<string | null>(null);
  
  const [answerText, setAnswerText] = useState('');
  const [answerLink, setAnswerLink] = useState('');
  const [answerImageFile, setAnswerImageFile] = useState<File | null>(null);
  const [existingAnswerImageUrl, setExistingAnswerImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (editQuizId) {
      const fetchQuiz = async () => {
        setIsLoading(true);
        try {
          const quiz = await quizApiClient.get(editQuizId);
          setPoint(quiz.point);
          setQuestionText(quiz.questionText || '');
          setQuestionLink(quiz.questionLink || '');
          setExistingQuestionImageUrl(quiz.questionImage || null);
          setAnswerText(quiz.answerText || '');
          setAnswerLink(quiz.answerLink || '');
          setExistingAnswerImageUrl(quiz.answerImage || null);
        } catch (error) {
          console.error(error);
          alert('クイズ情報の取得に失敗しました。');
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuiz();
    } else {
      setPoint(initialPoint);
    }
  }, [editQuizId, initialPoint]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!questionText && !questionImageFile && !existingQuestionImageUrl) {
      alert('問題文または問題画像のどちらかは必須です。');
      return;
    }
    if (!answerText && !answerImageFile && !existingAnswerImageUrl) {
      alert('解答文または解答画像のどちらかは必須です。');
      return;
    }

    try {
      setIsLoading(true);
      const tId = tournamentId || '';
      const pId = participantId || '';

      const questionImageUrl = questionImageFile
        ? await uploadApiClient.uploadImage(questionImageFile, tId, pId)
        : existingQuestionImageUrl;

      const answerImageUrl = answerImageFile 
        ? await uploadApiClient.uploadImage(answerImageFile, tId, pId) 
        : existingAnswerImageUrl;

      const quizData = {
        point,
        order,
        questionText,
        questionImage: questionImageUrl,
        questionLink,
        answerText,
        answerImage: answerImageUrl,
        answerLink,
        tournamentId: tId,
        participantId: pId,
      };

      if (editQuizId) {
        await quizApiClient.update(editQuizId, quizData);
        alert('問題が更新されました！');
      } else {
        await quizApiClient.create(quizData);
        alert('問題が作成されました！');
      }

      navigate(pathToParticipantDashboard(tId, pId));
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && editQuizId && !questionText) {
     return (
       <StyledContainer maxWidth="md" sx={{ textAlign: 'center' }}>
         <CircularProgress />
       </StyledContainer>
     );
  }

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {editQuizId ? '問題の編集' : '新しい問題の作成'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Input
          label="配点"
          type="number"
          required
          value={point}
          // 配点はURLパラメータから指定されるため変更不可とする
          inputProps={{ readOnly: true }}
          sx={{ mb: 3, width: '150px' }}
        />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <StyledSection>
              <Typography variant="h6" gutterBottom>
                問題の作成
              </Typography>
              <Input
                label="問題文"
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
              {questionImageFile ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  選択中のファイル: {questionImageFile.name}
                </Typography>
              ) : existingQuestionImageUrl ? (
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  （設定済みの画像あり）
                </Typography>
              ) : null}
              <Input
                label="参考リンク"
                fullWidth
                value={questionLink}
                onChange={(e) => setQuestionLink(e.target.value)}
              />
            </StyledSection>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledSection>
              <Typography variant="h6" gutterBottom>
                解答の作成
              </Typography>
              <Input
                label="解答文"
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
              {answerImageFile ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  選択中のファイル: {answerImageFile.name}
                </Typography>
              ) : existingAnswerImageUrl ? (
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  （設定済みの画像あり）
                </Typography>
              ) : null}
              <Input label="参考リンク" fullWidth value={answerLink} onChange={(e) => setAnswerLink(e.target.value)} />
            </StyledSection>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button type="submit" variant="contained" color="primary" size="large" disabled={isLoading}>
            {editQuizId ? 'この内容で更新する' : 'この内容で問題を保存する'}
          </Button>
        </Box>
      </Box>
    </StyledContainer>
  );
};

export default QuizCreatorPage;
