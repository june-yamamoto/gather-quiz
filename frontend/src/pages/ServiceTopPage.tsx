import { useState, useEffect } from 'react';
import { GettingStarted } from '../components/GettingStarted';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Container, Typography, Box, List, ListItemText, ListItemButton, Paper } from '@mui/material';
import { pathToTournamentCreation, pathToTournamentPortal } from '../helpers/route-helpers';
import { Button } from '../components/design-system/Button/Button';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(5),
}));

type ViewedTournament = {
  id: string;
  name: string;
  lastViewed: number;
};

const ServiceTopPage = () => {
  const [viewedTournaments, setViewedTournaments] = useState<ViewedTournament[]>([]);

  useEffect(() => {
    const history = localStorage.getItem('viewedTournaments');
    if (history) {
      setViewedTournaments(JSON.parse(history));
    }
  }, []);

  return (
    <StyledContainer maxWidth="md" sx={{ mb: 5, py: { xs: 2, sm: 3 } }}>
      <Typography variant="overline" color="secondary" sx={{ letterSpacing: '0.18em', fontWeight: 700 }}>QUIZ, TOGETHER.</Typography>
      <Typography
        variant="h2"
        component="h1"
        gutterBottom
        sx={{
          fontSize: {
            xs: '2.5rem', // for extra-small screens
            sm: '3.5rem', // for small screens
            md: '4rem', // for medium screens
          },
        }}
      >
        GatherQuiz
      </Typography>
      <Typography
        variant="h5"
        component="h2"
        color="textSecondary"
        paragraph
        sx={{
          fontSize: {
            xs: '1rem', // for extra-small screens
            sm: '1.25rem', // for small screens
          },
        }}
      >
        みんなで問題を持ち寄る、クイズ大会開催ツール
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button component={Link} to={pathToTournamentCreation()} variant="contained" color="primary" size="large">
          クイズ大会を新しく作成する
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mt: 5, textAlign: 'left', borderTop: 1, borderColor: 'divider', pt: 3 }}>
        {[
          ['01', '大会をつくる', '配点とルールを決めて、参加者を招待。'],
          ['02', '問いを持ち寄る', 'スマートフォンから、自分だけの問題を。'],
          ['03', 'みんなで楽しむ', '問題ボードを囲んで、答えを見つけよう。'],
        ].map(([number, title, description]) => <Box key={number}>
          <Typography color="secondary" variant="caption" sx={{ fontWeight: 800 }}>{number}</Typography>
          <Typography variant="h6" sx={{ my: 1 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </Box>)}
      </Box>

      <GettingStarted />
      {viewedTournaments.length > 0 && (
        <Box sx={{ mt: 5, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            最近アクセスした大会
          </Typography>
          <Paper variant="outlined">
            <List>
              {viewedTournaments.map((t) => (
                <ListItemButton key={t.id} component={Link} to={pathToTournamentPortal(t.id)}>
                  <ListItemText primary={t.name} secondary={`ID: ${t.id}`} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </StyledContainer>
  );
};

export default ServiceTopPage;
