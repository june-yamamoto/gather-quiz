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

  // 大会の配点設定をパース
  const points = status?.tournamentPoints ? status.tournamentPoints.split(',').map(Number) : [];

  return (
    <StyledContainer maxWidth="md">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" component="h1">
          {status?.participantName} さんのダッシュボード
        </Typography>
      </Box>

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
      </Card>

      <Typography variant="h5" component="h2" gutterBottom>
        問題リスト
      </Typography>
      <Card sx={{ textAlign: 'left', p: 0 }}>
        <List>
          {points.map((point, index) => {
            // この順序(index)に対応する作成済みクイズを探す
            // クイズのorderプロパティは0から始まると仮定
            // (まだbackendのQuizモデルでorderが未実装だったり、データ移行前だとundefinedの可能性もあるので注意)
            // ただし、これからの作成フローではorderが入る。既存データについてはorder=0のままかもしれない。
            // ここでは簡易的に「orderが一致するもの」を探す。
            // もしorderがまだデータになければ、配列のindex等でマッチングするロジックが必要だが、
            // 今回の改修でbackendはorderを保存するようになる。
            const quiz = status?.createdQuizzes.find((q) => q.order === index);
            
            return (
              <div key={index}>
                <ListItem
                  secondaryAction={
                    <Button
                      component={Link}
                      to={
                        quiz
                          ? `${pathToQuizCreator(tournamentId || '', participantId || '')}?edit=${quiz.id}&order=${index}&point=${point}`
                          : `${pathToQuizCreator(tournamentId || '', participantId || '')}?order=${index}&point=${point}`
                      }
                      variant={quiz ? 'outlined' : 'contained'}
                      color="primary"
                      size="small"
                    >
                      {quiz ? '編集する' : '作成する'}
                    </Button>
                  }
                  sx={{ py: 2 }}
                >
                  <ListItemText
                    primary={`第${index + 1}問 (${point}点)`}
                    secondary={
                      quiz ? (
                        <>
                          Q. {quiz.questionText || '（画像のみ）'} <br />
                          A. {quiz.answerText || '（画像のみ）'}
                        </>
                      ) : (
                        '未作成'
                      )
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {index < points.length - 1 && <Divider component="li" />}
              </div>
            );
          })}
        </List>
      </Card>
    </StyledContainer>
  );
};

export default ParticipantDashboardPage;
