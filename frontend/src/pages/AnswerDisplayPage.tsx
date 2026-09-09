import { useState } from 'react';
import { TeamJudging } from '../components/TeamJudging';
import { useParams, useNavigate } from 'react-router-dom';
import { pathToQuizBoard } from '../helpers/route-helpers';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { quizApiClient } from '../api/QuizApiClient';
import { AnswerDisplayContainer } from '../components/AnswerDisplayContainer';

const AnswerDisplayPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [judgingOpen, setJudgingOpen] = useState(false);

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
    <Box sx={{ height: '100dvh', width: '100%' }}>
      <AnswerDisplayContainer quiz={quiz} onButtonClick={quiz.hasTeams ? () => setJudgingOpen(true) : backToBoard} buttonText={quiz.hasTeams ? 'チームの正誤を設定' : 'ボードに戻る'} />
      {quiz.hasTeams && <TeamJudging quiz={quiz} open={judgingOpen} onClose={() => setJudgingOpen(false)} onSaved={backToBoard} />}
    </Box>
  );
};

export default AnswerDisplayPage;
