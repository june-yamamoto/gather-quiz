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
    // TODO: クイズ情報から取得しているが、将来的にはより適切な方法で大会IDを取得する必要がある
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
        {/* TODO: 画像やリンクが存在する場合に表示する処理を追加する */}
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
