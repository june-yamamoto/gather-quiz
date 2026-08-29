import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { pathToAnswerDisplay } from '../helpers/route-helpers';
import { quizApiClient } from '../api/QuizApiClient';
import { QuizDisplayContainer } from '../components/QuizDisplayContainer';

const QuizDisplayPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const {
    data: quiz,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => {
      if (!quizId) {
        throw new Error('Quiz ID is not defined');
      }
      return quizApiClient.get(quizId);
    },
    enabled: !!quizId,
  });

  const showAnswer = () => {
    if (quizId) {
      navigate(pathToAnswerDisplay(quizId));
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !quiz) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">エラー: {error?.message || 'クイズの読み込みに失敗しました。'}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ height: '100vh', width: '100vw' }}>
      <QuizDisplayContainer quiz={quiz} onButtonClick={showAnswer} buttonText="正解を見る" />
    </Box>
  );
};

export default QuizDisplayPage;
