import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { useState } from 'react';
import { resolveMedia } from '../helpers/media';
import { useQuizOpened } from '../helpers/use-quiz-opened';
import { useQuery } from '@tanstack/react-query';
import { pathToAnswerDisplay } from '../helpers/route-helpers';
import { quizApiClient } from '../api/QuizApiClient';
import { QuizDisplayContainer } from '../components/QuizDisplayContainer';

const QuizDisplayPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loadedImage, setLoadedImage] = useState('');
  const [playedMedia, setPlayedMedia] = useState('');

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

  const media = quiz?.questionLink ? resolveMedia(quiz.questionLink) : undefined;
  const mediaReady = !quiz?.questionLink || (media?.kind === 'link') || playedMedia === `${quiz?.id}:${quiz?.questionLink}`;
  const record = useQuizOpened(quiz?.id === quizId && !error ? quiz : undefined,
    !!quiz && mediaReady && (!quiz.questionImage || loadedImage === `${quiz.id}:${quiz.questionImage}`));

  const showAnswer = () => {
    if (quizId) {
      navigate(pathToAnswerDisplay(quizId));
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 3 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !quiz) {
    return (
      <Container sx={{ mt: 3 }}>
        <Typography color="error">エラー: {error?.message || 'クイズの読み込みに失敗しました。'}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ height: '100dvh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {record.error && <Alert severity="warning" action={<Button onClick={record.retry}>既読保存を再試行</Button>}>
        既読を保存できませんでした。
      </Alert>}
      <QuizDisplayContainer quiz={quiz} onButtonClick={showAnswer} buttonText="正解を見る"
        onQuestionMediaPlayed={() => setPlayedMedia(`${quiz.id}:${quiz.questionLink}`)}
        onQuestionImageLoad={() => setLoadedImage(`${quiz.id}:${quiz.questionImage}`)} />
    </Box>
  );
};

export default QuizDisplayPage;
