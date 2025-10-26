import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { pathToQuizCreator } from '../helpers/route-helpers';
import { participantApiClient } from '../api/ParticipantApiClient';
import { Button } from '../components/design-system/Button/Button';
import { Card } from '../components/design-system/Card/Card';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const ParticipantDashboardPage = () => {
  const { tournamentId, participantId } = useParams();

  const {
    data: status,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['participant', participantId, 'quizzes'],
    queryFn: () => {
      if (!tournamentId || !participantId) {
        throw new Error('ID is not defined');
      }
      return participantApiClient.getQuizzes(tournamentId, participantId);
    },
    enabled: !!tournamentId && !!participantId,
  });

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

      <Card sx={{ my: 4, textAlign: 'left' }}>
        <Typography variant="h6" gutterBottom>
          問題作成ステータス
        </Typography>
        <Typography variant="body1">
          あと{' '}
          <Typography component="span" variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
            {status?.remainingQuestions ?? 0}
          </Typography>{' '}
          問、作成してください。
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            component={Link}
            to={pathToQuizCreator(tournamentId || '', participantId || '')}
            variant="contained"
            color="primary"
          >
            新しい問題を作成する
          </Button>
        </Box>
      </Card>

      <Typography variant="h5" component="h2" gutterBottom>
        作成済みの問題
      </Typography>
      <Card sx={{ textAlign: 'left', p: 0 }}>
        <List>
          {status?.createdQuizzes.map((quiz, index) => (
            <div key={quiz.id}>
              <ListItem sx={{ py: 2 }}>
                <ListItemText
                  primary={quiz.questionText || '（問題文がありません）'}
                  secondary={`正解: ${quiz.answerText || '（解答文がありません）'}`}
                />
                {/* TODO: 作成した問題を編集・削除できるように、今後ボタンをここに追加する */}
              </ListItem>
              {index < status.createdQuizzes.length - 1 && <Divider component="li" />}
            </div>
          ))}
        </List>
      </Card>
    </StyledContainer>
  );
};

export default ParticipantDashboardPage;
