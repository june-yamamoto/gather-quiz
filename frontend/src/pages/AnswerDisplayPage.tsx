import { useParams, useNavigate } from 'react-router-dom';
import { pathToQuizBoard } from '../helpers/route-helpers';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
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
        bgcolor: '#FFF5F5', // Light reddish background for answer
        p: '2vmin',
        boxSizing: 'border-box',
        // Decorative frame
        border: '1vmin solid',
        borderColor: 'error.main', // Red border for answer
        borderRadius: '2vmin',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ mb: '2vmin', display: 'flex', alignItems: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'bold', borderBottom: '0.2vmin solid #ccc', pb: '1vmin', width: '100%', whiteSpace: 'pre-wrap', fontSize: '3vmin' }}>
          Q. {quiz.questionText}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: '6vmin',
            mb: '4vmin',
            px: '4vmin',
            color: 'error.main',
            textShadow: '0.1vmin 0.1vmin 0.2vmin rgba(0,0,0,0.1)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.2,
          }}
        >
          A. {quiz.answerText}
        </Typography>

        {quiz.answerImage && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden', p: '2vmin' }}>
            <img
              src={quiz.answerImage}
              alt="解答画像"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '1vmin',
                boxShadow: '0 0.5vmin 1.5vmin rgba(0,0,0,0.15)',
              }}
            />
          </Box>
        )}

        {quiz.answerLink && (
          <Typography variant="h6" align="center" sx={{ mt: '2vmin', fontSize: '2.5vmin' }}>
            参考リンク:{' '}
            <a href={quiz.answerLink} target="_blank" rel="noopener noreferrer" style={{ color: '#d32f2f', textDecoration: 'underline' }}>
              {quiz.answerLink}
            </a>
          </Typography>
        )}
      </Box>

      <Box sx={{ mt: '2vmin', textAlign: 'center', pb: '2vmin' }}>
        <Button
          variant="contained"
          size="large"
          onClick={backToBoard}
          sx={{
            minWidth: '20vmin',
            fontSize: '2.5vmin',
            borderRadius: '4vmin',
            boxShadow: '0 0.5vmin 0.8vmin rgba(0,0,0,0.2)',
            bgcolor: 'secondary.main', // Green button to go back
            '&:hover': {
              bgcolor: 'secondary.dark',
            },
            py: '1vmin',
            px: '4vmin',
          }}
        >
          ボードに戻る
        </Button>
      </Box>
    </Box>
  );
};

export default AnswerDisplayPage;
