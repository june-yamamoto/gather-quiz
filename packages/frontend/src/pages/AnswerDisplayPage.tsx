import { useParams, useNavigate } from 'react-router-dom';
import { pathToQuizBoard } from '../helpers/route-helpers';
import { Container, Typography, Box, Divider, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { quizApiClient } from '../api/QuizApiClient';
import { Button } from '../components/design-system/Button/Button';
import { Card } from '../components/design-system/Card/Card';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
}));

const AnswerDisplayPage = () => {
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
    <StyledContainer maxWidth="md">
      <Card sx={{ width: '100%' }}>
        <Typography variant="h6" color="text.secondary">
          Q. {quiz.questionText}
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            my: 8,
            fontWeight: 'bold',
            fontSize: {
              xs: '2.5rem',
              sm: '3rem',
              md: '3.5rem',
            },
          }}
        >
          A. {quiz.answerText}
        </Typography>
        {/* TODO: 画像やリンクが存在する場合に表示する処理を追加する */}
      </Card>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" size="large" onClick={backToBoard}>
          ボードに戻る
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default AnswerDisplayPage;
