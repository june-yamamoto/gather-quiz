import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Quiz } from '../models/Quiz';
import { pathToAnswerDisplay } from '../helpers/route-helpers';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
}));

const QuizContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '900px',
}));

const QuizDisplayPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }
        const data = await response.json();
        setQuiz(Quiz.fromApi(data));
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const showAnswer = () => {
    if (quizId) {
      navigate(pathToAnswerDisplay(quizId));
    }
  };

  if (!quiz) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <StyledContainer>
      <QuizContentPaper elevation={3}>
        <Typography variant="h6" color="text.secondary" align="right">
          {quiz.point}点問題
        </Typography>
        <Typography variant="h3" align="center" gutterBottom sx={{ my: 4 }}>
          Q. {quiz.questionText}
        </Typography>
        {/* TODO: Display image and link if they exist */}
      </QuizContentPaper>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" size="large" onClick={showAnswer}>
          正解を見る
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default QuizDisplayPage;
