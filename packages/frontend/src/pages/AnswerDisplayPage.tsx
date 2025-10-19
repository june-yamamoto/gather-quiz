import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

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

const AnswerDisplayPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }
        const data = await response.json();
        setQuiz(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const backToBoard = () => {
    // TODO: Get tournamentId properly
    navigate(`/tournaments/${quiz.tournamentId}/board`);
  };

  if (!quiz) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <StyledContainer>
      <QuizContentPaper elevation={3}>
        <Typography variant="h6" color="text.secondary">
          Q. {quiz.questionText}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h3" align="center" gutterBottom sx={{ my: 4 }}>
          A. {quiz.answerText}
        </Typography>
        {/* TODO: Display image and link if they exist */}
      </QuizContentPaper>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" size="large" onClick={backToBoard}>
          ボードに戻る
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default AnswerDisplayPage;
