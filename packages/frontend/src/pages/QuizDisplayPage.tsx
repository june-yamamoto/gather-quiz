import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { pathToAnswerDisplay } from '../helpers/route-helpers';
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

const QuizDisplayPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const fetchQuiz = useCallback(() => {
    if (!quizId) {
      return Promise.reject(new Error('Quiz ID is not defined'));
    }
    return quizApiClient.get(quizId);
  }, [quizId]);

  const { data: quiz, error, isLoading } = useApi(fetchQuiz);

  const showAnswer = () => {
    if (quizId) {
      navigate(pathToAnswerDisplay(quizId));
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
        <Typography variant="h6" color="text.secondary" align="right">
          {quiz.point}点問題
        </Typography>
        <Typography variant="h3" align="center" gutterBottom sx={{ my: 4 }}>
          Q. {quiz.questionText}
        </Typography>
        {/* TODO: Display image and link if they exist */}
      </StyledQuizContentPaper>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" size="large" onClick={showAnswer}>
          正解を見る
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default QuizDisplayPage;
