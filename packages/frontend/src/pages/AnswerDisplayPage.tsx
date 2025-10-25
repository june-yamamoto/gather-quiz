import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pathToQuizBoard } from '../helpers/route-helpers';
import { Container, Typography, Box, Paper, Button, Divider, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { quizApiClient } from '../api/QuizApiClient';
import { useApi } from '../hooks/useApi';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
}));

const StyledQuizContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '900px',
}));

const AnswerDisplayPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const fetchQuiz = useCallback(() => {
    if (!quizId) {
      return Promise.reject(new Error('Quiz ID is not defined'));
    }
    return quizApiClient.get(quizId);
  }, [quizId]);

  const { data: quiz, error, isLoading } = useApi(fetchQuiz);

  const backToBoard = () => {
    if (quiz) {
      navigate(pathToQuizBoard(quiz.tournamentId));
    }
  };

  if (isLoading) {
    return (
      <StyledContainer sx={{ textAlign: 'center' }}>
        <CircularProgress />
      </StyledContainer>
    );
  }

  if (error || !quiz) {
    return (
      <StyledContainer>
        <Typography color="error">エラー: {error?.message || 'クイズの読み込みに失敗しました。'}</Typography>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledQuizContentPaper elevation={3}>
        <Typography variant="h6" color="text.secondary">
          Q. {quiz.questionText}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h3" align="center" gutterBottom sx={{ my: 4 }}>
          A. {quiz.answerText}
        </Typography>
        {/* TODO: 画像やリンクが存在する場合に表示する処理を追加する */}
      </StyledQuizContentPaper>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" size="large" onClick={backToBoard}>
          ボードに戻る
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default AnswerDisplayPage;
