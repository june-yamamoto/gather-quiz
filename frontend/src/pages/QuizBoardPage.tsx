import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { Participant } from '../models/Participant';
import { Quiz } from '../models/Quiz';
import { pathToQuizDisplay, pathToTournamentPortal } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { QuizCard } from '../components/design-system/QuizCard/QuizCard';
import { Button } from '../components/design-system/Button/Button';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const ParticipantName = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  borderRadius: '8px',
}));

const PointLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: '100%',
  paddingRight: theme.spacing(2),
}));

const QuizBoardPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [regulationOpen, setRegulationOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);

  const {
    data: tournament,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['tournament', tournamentId, 'board'],
    queryFn: () => {
      if (!tournamentId) {
        throw new Error('Tournament ID is not defined');
      }
      return tournamentApiClient.getBoard(tournamentId);
    },
    enabled: !!tournamentId,
  });

  const handleQuizSelect = (quizId: string) => {
    navigate(pathToQuizDisplay(quizId));
  };

  const handleFinishTournament = () => {
    setFinishDialogOpen(true);
  };

  const handleBackToPortal = () => {
    if (tournamentId) {
      navigate(pathToTournamentPortal(tournamentId));
    }
  };

  if (isLoading) {
    return (
      <StyledContainer maxWidth="xl" sx={{ textAlign: 'center' }}>
        <CircularProgress />
      </StyledContainer>
    );
  }

  if (error || !tournament) {
    return (
      <StyledContainer maxWidth="xl">
        <Typography color="error">エラー: {error?.message || 'ボードの読み込みに失敗しました。'}</Typography>
      </StyledContainer>
    );
  }

  const points = tournament.points.split(',').map(Number);
  const participantCount = tournament.participants.length;
  // Calculate column width based on participant count, with a max of 12 columns in Grid
  const columnWidth = Math.floor(10 / participantCount);

  // 全ての問題(作成済みのもの)が既読かチェック
  // 参加者が一人もいない、またはクイズが一つもない場合は完了とはみなさない（開始前なので）
  const totalQuizzes = tournament.participants.reduce((acc, p) => acc + p.quizzes.length, 0);
  const openedQuizzes = tournament.participants.reduce(
    (acc, p) => acc + p.quizzes.filter((q) => q.isOpened).length,
    0
  );
  
  const isAllOpened = totalQuizzes > 0 && totalQuizzes === openedQuizzes;

  return (
    <StyledContainer maxWidth="xl">
      <Box sx={{ position: 'relative', mb: 2, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {tournament.name}
        </Typography>
        <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
          <Button variant="outlined" size="small" onClick={() => setRegulationOpen(true)}>
            ルール確認
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        {/* Header Row */}
        <Grid container spacing={2}>
          <Grid item xs={2} />
          {tournament.participants.map((p: Participant) => {
            const isParticipantVisible = p.quizzes.some((q) => q.isOpened);
            return (
              <Grid item xs={columnWidth} key={p.id} textAlign="center">
                <ParticipantName variant="h6">{isParticipantVisible ? p.name : '???'}</ParticipantName>
              </Grid>
            );
          })}
        </Grid>

        {/* Rows for each point value */}
        {points.map((point: number, index: number) => (
          <Grid container spacing={2} key={`${point}-${index}`} sx={{ mt: 1 }} alignItems="stretch">
            <Grid item xs={2}>
              <PointLabel variant="h5">{point}点</PointLabel>
            </Grid>
            {tournament.participants.map((p: Participant) => {
              // orderでクイズを特定する (orderが一致するものを探す)
              const quiz = p.quizzes.find((q: Quiz) => q.order === index);
              return (
                <Grid item xs={columnWidth} key={`${p.id}-${index}`}>
                  {quiz ? (
                    <QuizCard
                      point={point}
                      isAnswered={quiz.isOpened}
                      onClick={() => handleQuizSelect(quiz.id)}
                    />
                  ) : (
                    <QuizCard point={point} isUncreated />
                  )}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>

      {isAllOpened && (
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleFinishTournament}
            sx={{
                fontSize: '1.5rem',
                py: 2,
                px: 6,
                borderRadius: '50px',
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
            }}
          >
            大会を終了する！
          </Button>
        </Box>
      )}

      {/* Regulation Dialog */}
      <Dialog open={regulationOpen} onClose={() => setRegulationOpen(false)}>
        <DialogTitle>大会レギュレーション</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ whiteSpace: 'pre-wrap' }}>
            {tournament.regulation || 'レギュレーションは設定されていません。'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegulationOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* Finish Dialog */}
      <Dialog open={finishDialogOpen} onClose={() => setFinishDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
            お疲れ様でした！
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              全ての問題が終了しました。
            </Typography>
            <Typography variant="body1" color="text.secondary">
              クイズ大会にご参加いただきありがとうございました。
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button onClick={handleBackToPortal} variant="contained" color="primary" size="large">
            大会ポータルへ戻る
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default QuizBoardPage;
