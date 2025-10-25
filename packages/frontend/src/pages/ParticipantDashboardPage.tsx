import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { pathToQuizCreator } from '../helpers/route-helpers';
import { participantApiClient } from '../api/ParticipantApiClient';
import { useApi } from '../hooks/useApi';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledStatusPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ParticipantDashboardPage = () => {
  const { tournamentId, participantId } = useParams();

  const fetchQuizStatus = useCallback(() => {
    if (!participantId || !tournamentId) {
      return Promise.reject(new Error('ID is not defined'));
    }
    return participantApiClient.getQuizzes(tournamentId, participantId);
  }, [participantId, tournamentId]);

  const { data: status, error, isLoading } = useApi(fetchQuizStatus);

  if (isLoading) {
    return (
      <StyledContainer maxWidth="md" sx={{ textAlign: 'center' }}>
        <CircularProgress />
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer maxWidth="md">
        <Typography color="error">エラー: {error.message}</Typography>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        参加者ダッシュボード
      </Typography>

      <StyledStatusPaper elevation={3}>
        <Typography variant="h6" gutterBottom>
          問題作成ステータス
        </Typography>
        <Typography variant="body1">
          あと{' '}
          <Typography component="span" variant="h5" color="secondary">
            {status?.remainingQuestions ?? 0}
          </Typography>{' '}
          問、作成してください。
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            component={Link}
            to={pathToQuizCreator(tournamentId || '', participantId || '')}
            variant="contained"
            color="primary"
          >
            新しい問題を作成する
          </Button>
        </Box>
      </StyledStatusPaper>

      <Typography variant="h5" component="h2" gutterBottom>
        作成済みの問題
      </Typography>
      <Paper>
        <List>
          {status?.createdQuizzes.map((quiz, index) => (
            <div key={quiz.id}>
              <ListItem>
                <ListItemText
                  primary={quiz.questionText || '（問題文がありません）'}
                  secondary={`正解: ${quiz.answerText || '（解答文がありません）'}`}
                />
                {/* TODO: 作成した問題を編集・削除できるように、今後ボタンをここに追加する */}
              </ListItem>
              {index < status.createdQuizzes.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </Paper>
    </StyledContainer>
  );
};

export default ParticipantDashboardPage;
