import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pathToQuizBoard } from '../helpers/route-helpers';
import { Container, Typography, Box, Paper, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Quiz } from '../models/Quiz';
import { quizApiClient } from '../api/QuizApiClient';

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
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      try {
        const quizData = await quizApiClient.get(quizId);
        setQuiz(quizData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const backToBoard = () => {
    if (quiz) {
      navigate(pathToQuizBoard(quiz.tournamentId));
    }
  };

  if (!quiz) {
    return <Typography>Loading...</Typography>;
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
