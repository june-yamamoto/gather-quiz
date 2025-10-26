import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Container, Typography, Box } from '@mui/material';
import { pathToTournamentCreation } from '../helpers/route-helpers';
import { Button } from '../components/design-system/Button/Button';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

const ServiceTopPage = () => {
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
    </StyledContainer>
  );
};

export default ServiceTopPage;
