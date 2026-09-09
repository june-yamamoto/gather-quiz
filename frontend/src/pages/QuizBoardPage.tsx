import { scoringApiClient } from '../api/ScoringApiClient';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { Quiz } from '../models/Quiz';
import { pathToQuizDisplay, pathToTournamentResults } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { QuizCard } from '../components/design-system/QuizCard/QuizCard';
import { Button } from '../components/design-system/Button/Button';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  [theme.breakpoints.down('sm')]: { paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) },
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
  const [finishError, setFinishError] = useState('');
  const [finishing, setFinishing] = useState(false);
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

  /** サーバーで判定漏れを確認してから結果を公開する。 */
  const finish = async () => {
    if (!tournamentId || finishing) return;
    setFinishing(true); setFinishError('');
    try { await scoringApiClient.finish(tournamentId); navigate(pathToTournamentResults(tournamentId)); }
    catch (e) { setFinishError(e instanceof Error ? e.message : '終了に失敗しました。'); }
    finally { setFinishing(false); }
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {tournament.name}
        </Typography>
        <Box>
          <Button variant="outlined" size="small" onClick={() => setRegulationOpen(true)}>
            ルール確認
          </Button>
        </Box>
      </Box>

      <Box role="region" aria-label="問題一覧" tabIndex={0} sx={{ overflowX: 'auto', pb: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, tournament.participants.length)}, minmax(180px, 1fr))`, gap: 2 }}>
        {tournament.participants.map((p, column) => {
            const isParticipantVisible = p.quizzes.some((q) => q.isOpened);
            return (
                <Box key={p.id} sx={{ display: 'contents' }}>
                    <ParticipantName sx={{ gridColumn: column + 1, gridRow: 1 }} variant="h6" title={isParticipantVisible ? p.name : '???'}>
                        {isParticipantVisible ? p.name : '???'}
                    </ParticipantName>
                    {points.map((point, index) => {
                        const quiz = p.quizzes.find((q: Quiz) => q.order === index);
                        return (
                            <Box key={`${p.id}-${index}`} data-question-order={index} sx={{ gridColumn: column + 1, gridRow: index + 2, display: 'flex', minWidth: 0, '& > *': { height: '100%', boxSizing: 'border-box' } }}>
                                {quiz ? (
                                    <QuizCard
                                        point={point}
                                        label={tournament.questionSlots?.[index]?.label}
                                        choiceCount={quiz?.choiceCount}
                                        isAnswered={quiz.isOpened}
                                        genre={quiz.genre}
                                        onClick={() => handleQuizSelect(quiz.id)}
                                    />
                                ) : (
                                    <QuizCard point={point} label={tournament.questionSlots?.[index]?.label} isUncreated />
                                )}
                            </Box>
                        );
                    })}
                </Box>
            );
        })}
      </Box>

      </Box>

      {tournament.status === 'finished' && <Box sx={{ mt: 3, textAlign: 'center' }}><Button variant="contained" onClick={() => navigate(pathToTournamentResults(tournament.id))}>結果発表を見る</Button></Box>}
      {isAllOpened && tournament.status !== 'finished' && (
        <Box sx={{ mt: 5, textAlign: 'center' }}>
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
                backgroundColor: 'primary.main',
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
      <Dialog open={finishDialogOpen} onClose={finishing ? undefined : () => setFinishDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
            大会を終了して結果を発表しますか？
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              終了後はチームの判定を変更できません。
            </Typography>
            <Typography variant="body1" color="text.secondary">
              未保存の判定がある場合は、各解答画面で保存してから終了してください。
            </Typography>
          </Box>
        </DialogContent>
        {finishError && <Alert severity="error">{finishError}</Alert>}
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button onClick={() => setFinishDialogOpen(false)} disabled={finishing}>戻る</Button>
          <Button onClick={finish} disabled={finishing} variant="contained" color="primary" size="large">
            大会を終了して順位を発表
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default QuizBoardPage;
