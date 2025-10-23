import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { pathToTournamentPortal } from '../helpers/route-helpers';
import { Tournament } from '../models/Tournament';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const InfoPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
}));

const InfoBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const UrlDisplay = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  flexGrow: 1,
  wordBreak: 'break-all',
}));

const TournamentCreationCompletePage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      const response = await fetch(`/api/tournaments/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTournament(Tournament.fromApi(data));
      } else {
        console.error('Failed to fetch tournament');
      }
    };

    if (id) {
      fetchTournament();
    }
  }, [id]);

  const portalUrl = `${window.location.origin}${pathToTournamentPortal(id || '')}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        クイズ大会の作成が完了しました！
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        以下のURLは再発行できません。必ずブックマークやメモなどで保管してください。
      </Typography>

      {tournament && (
        <InfoPaper elevation={3}>
          <Typography variant="h6">大会名: {tournament.name}</Typography>
          <InfoBox>
            <Typography variant="subtitle2">▼ 参加者への招待URL (大会ポータルページ)</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UrlDisplay>{portalUrl}</UrlDisplay>
              <Button variant="outlined" onClick={() => copyToClipboard(portalUrl)}>
                コピー
              </Button>
            </Box>
          </InfoBox>
          <InfoBox>
            <Typography variant="subtitle2">▼ 管理用パスワード</Typography>
            <UrlDisplay>{location.state?.password || '********'} (あなたが設定したパスワード)</UrlDisplay>
          </InfoBox>
        </InfoPaper>
      )}

      <Box sx={{ mt: 3 }}>
        <Button component={Link} to={pathToTournamentPortal(id || '')} variant="contained">
          大会ポータルへ移動
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default TournamentCreationCompletePage;
