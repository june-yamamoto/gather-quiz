import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { Quiz } from '../models/Quiz';
import { pathToQuizDisplay, pathToTournamentPortal } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { QuizCard } from '../components/design-system/QuizCard/QuizCard';
import { Button } from '../components/design-system/Button/Button';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
}));

const ParticipantName = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
  borderRadius: '8px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'center',
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
      <StyledContainer maxWidth={false} sx={{ textAlign: 'center' }}>
        <CircularProgress />
      </StyledContainer>
    );
  }

  if (error || !tournament) {
    return (
      <StyledContainer maxWidth={false}>
        <Typography color="error">エラー: {error?.message || 'ボードの読み込みに失敗しました。'}</Typography>
      </StyledContainer>
    );
  }

  const points = tournament.points.split(',').map(Number);
  
  // 全ての問題(作成済みのもの)が既読かチェック
  const totalQuizzes = tournament.participants.reduce((acc, p) => acc + p.quizzes.length, 0);
  const openedQuizzes = tournament.participants.reduce(
    (acc, p) => acc + p.quizzes.filter((q) => q.isOpened).length,
    0
  );
  
  const isAllOpened = totalQuizzes > 0 && totalQuizzes === openedQuizzes;

  return (
    <StyledContainer maxWidth={false}>
      <Box sx={{ position: 'relative', mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {tournament.name}
        </Typography>
        <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
          <Button variant="outlined" size="small" onClick={() => setRegulationOpen(true)}>
            ルール確認
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        {tournament.participants.map((p) => {
            const isParticipantVisible = p.quizzes.some((q) => q.isOpened);
            return (
                <Box key={p.id} sx={{ minWidth: '180px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <ParticipantName variant="h6" title={isParticipantVisible ? p.name : '???'}>
                        {isParticipantVisible ? p.name : '???'}
                    </ParticipantName>
                    {points.map((point, index) => {
                        const quiz = p.quizzes.find((q: Quiz) => q.order === index);
                        return (
                            <Box key={`${p.id}-${index}`} sx={{ width: '100%' }}>
                                {quiz ? (
                                    <QuizCard
                                        point={point}
                                        isAnswered={quiz.isOpened}
                                        genre={quiz.genre}
                                        onClick={() => handleQuizSelect(quiz.id)}
                                    />
                                ) : (
                                    <QuizCard point={point} isUncreated />
                                )}
                            </Box>
                        );
                    })}
                </Box>
            );
        })}
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
