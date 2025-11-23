import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, CircularProgress, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { Participant } from '../models/Participant';
import { Quiz } from '../models/Quiz';
import { pathToQuizDisplay } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { QuizCard } from '../components/design-system/QuizCard/QuizCard';

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
  const participantCount = tournament.participants.length;
  // Calculate column width based on participant count, with a max of 12 columns in Grid
  const columnWidth = Math.floor(10 / participantCount);

  return (
    <StyledContainer maxWidth="xl">
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        {tournament.name}
      </Typography>
      <Box sx={{ mt: 4 }}>
        {/* Header Row */}
        <Grid container spacing={2}>
          <Grid item xs={2} />
          {tournament.participants.map((p: Participant) => (
            <Grid item xs={columnWidth} key={p.id} textAlign="center">
              <ParticipantName variant="h6">{p.name}</ParticipantName>
            </Grid>
          ))}
        </Grid>

        {/* Rows for each point value */}
        {points.map((point: number) => (
          <Grid container spacing={2} key={point} sx={{ mt: 1 }} alignItems="stretch">
            <Grid item xs={2}>
              <PointLabel variant="h5">{point}点</PointLabel>
            </Grid>
            {tournament.participants.map((p: Participant) => {
              const quiz = p.quizzes.find((q: Quiz) => q.point === point);
              return (
                <Grid item xs={columnWidth} key={`${p.id}-${point}`}>
                  {quiz ? (
                    <QuizCard point={point} onClick={() => handleQuizSelect(quiz.id)} />
                  ) : (
                    <QuizCard point={point} />
                  )}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
    </StyledContainer>
  );
};

export default QuizBoardPage;
