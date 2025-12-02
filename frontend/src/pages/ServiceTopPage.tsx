import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Container, Typography, Box, List, ListItem, ListItemText, ListItemButton, Paper } from '@mui/material';
import { pathToTournamentCreation, pathToTournamentPortal } from '../helpers/route-helpers';
import { Button } from '../components/design-system/Button/Button';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
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
    <StyledContainer maxWidth="md">
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
      <Box sx={{ mt: 4 }}>
        <Button component={Link} to={pathToTournamentCreation()} variant="contained" color="primary" size="large">
          クイズ大会を新しく作成する
        </Button>
      </Box>

      {viewedTournaments.length > 0 && (
        <Box sx={{ mt: 8, textAlign: 'left' }}>
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
