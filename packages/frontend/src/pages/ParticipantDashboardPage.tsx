import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Quiz } from '../models/Quiz';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StatusPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ParticipantDashboardPage = () => {
  const { tournamentId, participantId } = useParams();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [remainingQuestions, setRemainingQuestions] = useState(0);

  useEffect(() => {
    if (!participantId) return;

    const fetchQuizStatus = async () => {
      try {
        const response = await fetch(`/api/tournaments/${tournamentId}/participants/${participantId}/quizzes`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz status');
        }
        const data = await response.json();

        const parsedQuizzes = data.createdQuizzes
          .map((quizData: unknown) => {
            try {
              return Quiz.fromApi(quizData);
            } catch (error) {
              console.error('Failed to parse quiz data:', error);
              return null;
            }
          })
          .filter((quiz: Quiz | null): quiz is Quiz => quiz !== null);

        setQuizzes(parsedQuizzes);
        setRemainingQuestions(data.remainingQuestions);
      } catch (error) {
        console.error(error);
        // TODO: エラーが発生した際に、ユーザーにフィードバックを示すUIを実装する
      }
    };

    fetchQuizStatus();
  }, [participantId, tournamentId]);

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        参加者ダッシュボード
      </Typography>

      <StatusPaper elevation={3}>
        <Typography variant="h6" gutterBottom>
          問題作成ステータス
        </Typography>
        <Typography variant="body1">
          あと{' '}
          <Typography component="span" variant="h5" color="secondary">
            {remainingQuestions}
          </Typography>{' '}
          問、作成してください。
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            component={Link}
            to={`/tournaments/${tournamentId}/participants/${participantId}/quizzes/new`}
            variant="contained"
            color="primary"
          >
            新しい問題を作成する
          </Button>
        </Box>
      </StatusPaper>

      <Typography variant="h5" component="h2" gutterBottom>
        作成済みの問題
      </Typography>
      <Paper>
        <List>
          {quizzes.map((quiz, index) => (
            <div key={quiz.id}>
              <ListItem>
                <ListItemText
                  primary={quiz.questionText || '（問題文がありません）'}
                  secondary={`正解: ${quiz.answerText || '（解答文がありません）'}`}
                />
                {/* TODO: 作成した問題を編集・削除できるように、今後ボタンをここに追加する */}
              </ListItem>
              {index < quizzes.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </Paper>
    </StyledContainer>
  );
};

export default ParticipantDashboardPage;
