import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Grid, ButtonBase, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { Participant } from '../models/Participant';
import { Quiz } from '../models/Quiz';
import { pathToQuizDisplay } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledQuizCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  width: '100%',
  height: '100px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}));

const QuizBoardPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

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

  return (
    <StyledContainer maxWidth="xl">
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        {tournament.name}
      </Typography>
      <Grid container spacing={2} sx={{ mt: 4 }}>
        {/* Header Row */}
        <Grid item xs={2} />
        {tournament.participants.map((p: Participant) => (
          <Grid item xs key={p.id} textAlign="center">
            <Typography variant="h6">{p.name}</Typography>
          </Grid>
        ))}

        {points.map((point: number, rowIndex: number) => (
          <Grid container item spacing={2} key={rowIndex} alignItems="center">
            <Grid item xs={2} textAlign="right">
              <Typography variant="h5">{point}点</Typography>
            </Grid>
            {tournament.participants.map((p: Participant) => {
              const quiz = p.quizzes.find((q: Quiz) => q.point === point);
              return (
                <Grid item xs={true} key={`${p.id}-${point}`}>
                  {quiz ? (
                    <ButtonBase sx={{ width: '100%' }} onClick={() => handleQuizSelect(quiz.id)}>
                      <StyledQuizCard elevation={3}>
                        <Typography variant="h6">{point}点</Typography>
                      </StyledQuizCard>
                    </ButtonBase>
                  ) : (
                    <StyledQuizCard elevation={1} sx={{ backgroundColor: 'grey.200' }} />
                  )}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Grid>
    </StyledContainer>
  );
};

export default QuizBoardPage;
