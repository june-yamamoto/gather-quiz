import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { pathToAnswerDisplay } from '../helpers/route-helpers';
import { quizApiClient } from '../api/QuizApiClient';
import { Button } from '../components/design-system/Button/Button';
import { Card } from '../components/design-system/Card/Card';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh', // Adjust as needed
}));

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
    <StyledContainer maxWidth="md">
      <Card sx={{ width: '100%' }}>
        <Typography variant="h5" color="text.secondary" align="right">
          {quiz.point}点問題
        </Typography>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            my: 8,
            fontSize: {
              xs: '2rem',
              sm: '2.5rem',
              md: '3rem',
            },
          }}
        >
          Q. {quiz.questionText}
        </Typography>
        {/* TODO: Display image and link if they exist */}
      </Card>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" size="large" onClick={showAnswer}>
          正解を見る
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default QuizDisplayPage;
