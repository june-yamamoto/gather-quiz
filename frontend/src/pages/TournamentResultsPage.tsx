import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Alert, Container, CircularProgress, Box } from '@mui/material';
import { scoringApiClient } from '../api/ScoringApiClient';
import { RankingReveal } from '../components/RankingReveal';
import { Button } from '../components/design-system/Button/Button';
import { pathToTournamentPortal } from '../helpers/route-helpers';
/** 終了前の直リンクでもサーバー側で結果公開を拒否する。 */
const TournamentResultsPage = () => {
  const { tournamentId = '' } = useParams();
  const { data, error, isLoading, refetch } = useQuery({ queryKey: ['results', tournamentId], queryFn: () => scoringApiClient.results(tournamentId), retry: false });
  return <Container maxWidth="md" sx={{ py: 5 }}>
    {isLoading && <CircularProgress />}
    {error && <Alert severity="error" action={<Button onClick={() => refetch()}>再試行</Button>}>{error.message}</Alert>}
    {data && <RankingReveal result={data} />}
    <Box sx={{ textAlign: 'center', mt: 4 }}><Button component={Link} to={pathToTournamentPortal(tournamentId)}>大会ポータルへ戻る</Button></Box>
  </Container>;
};
export default TournamentResultsPage;
