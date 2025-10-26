import { useParams, useLocation, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Container, Typography, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { pathToTournamentPortal } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { Button } from '../components/design-system/Button/Button';
import { Card } from '../components/design-system/Card/Card';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledInfoBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const StyledUrlDisplay = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  flexGrow: 1,
  wordBreak: 'break-all',
  textAlign: 'left',
}));

const TournamentCreationCompletePage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const { data: tournament } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Tournament ID is not defined');
      }
      return tournamentApiClient.get(id);
    },
    enabled: !!id,
  });

  const portalUrl = `${window.location.origin}${pathToTournamentPortal(id || '')}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => alert('コピーしました！'),
      () => alert('コピーに失敗しました。')
    );
  };

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        クイズ大会の作成が完了しました！
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        以下のURLは再発行できません。必ずブックマークやメモなどで保管してください。
      </Typography>

      {tournament && (
        <Card sx={{ mt: 4, textAlign: 'left' }}>
          <Typography variant="h6">大会名: {tournament.name}</Typography>
          <StyledInfoBox>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              ▼ 参加者への招待URL (大会ポータルページ)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <StyledUrlDisplay variant="body2">{portalUrl}</StyledUrlDisplay>
              <Button variant="outlined" onClick={() => copyToClipboard(portalUrl)}>
                コピー
              </Button>
            </Box>
          </StyledInfoBox>
          <StyledInfoBox>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              ▼ 管理用パスワード
            </Typography>
            <StyledUrlDisplay variant="body2">
              {location.state?.password || '********'} (あなたが設定したパスワード)
            </StyledUrlDisplay>
          </StyledInfoBox>
        </Card>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button component={Link} to={pathToTournamentPortal(id || '')} variant="contained" size="large">
          大会ポータルへ移動
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default TournamentCreationCompletePage;
