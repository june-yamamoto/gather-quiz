import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, List, ListItem, Divider, CircularProgress, Chip, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { pathToQuizCreator, pathToTournamentPortal } from '../helpers/route-helpers';
import { participantApiClient } from '../api/ParticipantApiClient';
import { Button } from '../components/design-system/Button/Button';
import { Card } from '../components/design-system/Card/Card';
import { QuizPreviewDialog } from '../components/QuizPreviewDialog';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const ParticipantDashboardPage = () => {
  const { tournamentId, participantId } = useParams();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuizId, setPreviewQuizId] = useState('');
  const [previewMode, setPreviewMode] = useState<'question' | 'answer'>('question');

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

  const handleOpenPreview = (quizId: string, mode: 'question' | 'answer') => {
    setPreviewQuizId(quizId);
    setPreviewMode(mode);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewQuizId('');
  };

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
            const quiz = status?.createdQuizzes.find((q) => q.order === index);
            
            return (
              <div key={index}>
                <ListItem sx={{ py: 2, display: 'block' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      第{index + 1}問 ({point}点)
                    </Typography>
                    <Box>
                      {quiz ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            color="info"
                            onClick={() => handleOpenPreview(quiz.id, 'question')}
                          >
                            問題確認
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="warning"
                            onClick={() => handleOpenPreview(quiz.id, 'answer')}
                          >
                            解答確認
                          </Button>
                          <Button
                            component={Link}
                            to={`${pathToQuizCreator(tournamentId || '', participantId || '')}?edit=${quiz.id}&order=${index}&point=${point}`}
                            variant="outlined"
                            color="primary"
                            size="small"
                          >
                            編集
                          </Button>
                        </Stack>
                      ) : (
                        <Button
                          component={Link}
                          to={`${pathToQuizCreator(tournamentId || '', participantId || '')}?order=${index}&point=${point}`}
                          variant="contained"
                          color="primary"
                          size="small"
                        >
                          作成する
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {quiz ? (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Q.</strong> {quiz.questionText || '（テキストなし）'}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {quiz.questionImage && <Chip label="画像あり" size="small" color="default" variant="outlined" />}
                          {quiz.questionLink && <Chip label="リンクあり" size="small" color="default" variant="outlined" />}
                        </Stack>
                      </Box>
                      <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>A.</strong> {quiz.answerText || '（テキストなし）'}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {quiz.answerImage && <Chip label="画像あり" size="small" color="default" variant="outlined" />}
                          {quiz.answerLink && <Chip label="リンクあり" size="small" color="default" variant="outlined" />}
                        </Stack>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      未作成
                    </Typography>
                  )}
                </ListItem>
                {index < points.length - 1 && <Divider component="li" />}
              </div>
            );
          })}
        </List>
      </Card>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          component={Link}
          to={pathToTournamentPortal(tournamentId || '')}
          variant="outlined"
          color="inherit"
        >
          大会ポータルへ戻る
        </Button>
      </Box>

      {/* Preview Dialog */}
      <QuizPreviewDialog
        open={previewOpen}
        onClose={handleClosePreview}
        quizId={previewQuizId}
        mode={previewMode}
      />
    </StyledContainer>
  );
};

export default ParticipantDashboardPage;
