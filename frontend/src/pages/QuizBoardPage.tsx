import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Typography, Grid, CircularProgress, Box } from '@mui/material';
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

  // 全ての問題が既読かチェック
  // 参加者全員のクイズ数が、大会の問題数(points.length)と一致し、かつ全てisOpenedである必要がある
  // または、単純に登録されている全クイズがisOpenedであるかを確認する (未作成の問題はどうする？ -> 未作成はボードに出ないので無視で良いか、あるいは完了とみなせないか)
  // ここでは「作成されたクイズが全て既読になっている」かつ「全員が規定数のクイズを作成している」を完了条件とするのが厳密だが、
  // UI上表示されているクイズが全て開かれたかどうかを基準にするのが自然。
  // 各参加者のquizzesを走査し、未読(isOpened === false)が一つでもあれば未完了。
  const isAllOpened = tournament.participants.every((p) =>
    p.quizzes.every((q) => q.isOpened) && p.quizzes.length === points.length
  );

  return (
    <StyledContainer maxWidth="xl">
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        {tournament.name}
      </Typography>
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
                    <QuizCard point={point} />
                  )}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>

      {isAllOpened && (
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            全ての問題が終了しました！
          </Typography>
          <Button
            component={Link}
            to={pathToTournamentPortal(tournamentId || '')}
            variant="contained"
            color="primary"
            size="large"
          >
            大会ポータルへ戻る
          </Button>
        </Box>
      )}
    </StyledContainer>
  );
};

export default QuizBoardPage;
