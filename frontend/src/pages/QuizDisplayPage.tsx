import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { pathToAnswerDisplay } from '../helpers/route-helpers';
import { quizApiClient } from '../api/QuizApiClient';
import { Button } from '../components/design-system/Button/Button';
import { getGenreColor } from '../helpers/color-helpers';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        bgcolor: 'background.paper', // Or a custom light color
        p: 3,
        boxSizing: 'border-box',
        // Decorative frame
        border: '8px solid',
        borderColor: 'primary.main',
        borderRadius: '16px',
        overflow: 'hidden', // Ensure content stays within border radius
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
            {quiz.genre && (
            <Typography
                variant="h4"
                sx={{
                fontWeight: 'bold',
                color: 'white',
                bgcolor: getGenreColor(quiz.genre),
                px: 3,
                py: 1,
                borderRadius: '0 0 16px 0',
                mt: -3,
                ml: -3,
                boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                }}
            >
                {quiz.genre}
            </Typography>
            )}
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            bgcolor: 'primary.main',
            px: 3,
            py: 1,
            borderRadius: '0 0 0 16px', // Decorative shape
            mt: -3, // Pull up to attach to top border
            mr: -3, // Pull right to attach to right border
          }}
        >
          {quiz.point}点問題
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
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
            mb: 4,
            px: 4,
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            whiteSpace: 'pre-wrap',
          }}
        >
          Q. {quiz.questionText}
        </Typography>

        {quiz.questionImage && (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden', p: 2 }}>
            <img
              src={quiz.questionImage}
              alt="問題画像"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
          </Box>
        )}

        {quiz.questionLink && (
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            参考リンク:{' '}
            <a href={quiz.questionLink} target="_blank" rel="noopener noreferrer" style={{ color: '#00529B', textDecoration: 'underline' }}>
              {quiz.questionLink}
            </a>
          </Typography>
        )}
      </Box>

      <Box sx={{ mt: 2, textAlign: 'center', pb: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={showAnswer}
          sx={{
            minWidth: '200px',
            fontSize: '1.5rem',
            borderRadius: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          }}
        >
          正解を見る
        </Button>
      </Box>
    </Box>
  );
};

export default QuizDisplayPage;
