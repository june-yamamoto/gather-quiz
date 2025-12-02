import { useParams, useNavigate } from 'react-router-dom';
import { pathToQuizBoard } from '../helpers/route-helpers';
import { Container, Typography, Box, Divider, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { quizApiClient } from '../api/QuizApiClient';
import { Button } from '../components/design-system/Button/Button';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        bgcolor: 'background.paper',
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          Q. {quiz.questionText}
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
            mb: 4,
            color: 'error.main',
          }}
        >
          A. {quiz.answerText}
        </Typography>

        {quiz.answerImage && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
            <img
              src={quiz.answerImage}
              alt="解答画像"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </Box>
        )}

        {quiz.answerLink && (
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            参考リンク:{' '}
            <a href={quiz.answerLink} target="_blank" rel="noopener noreferrer">
              {quiz.answerLink}
            </a>
          </Typography>
        )}
      </Box>

      <Box sx={{ mt: 2, textAlign: 'center', pb: 2 }}>
        <Button variant="contained" size="large" onClick={backToBoard} sx={{ minWidth: '200px', fontSize: '1.5rem' }}>
          ボードに戻る
        </Button>
      </Box>
    </Box>
  );
};

export default AnswerDisplayPage;
