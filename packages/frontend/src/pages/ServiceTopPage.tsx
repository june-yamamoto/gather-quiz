import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Button, Container, Typography, Box } from '@mui/material';
import { pathToTournamentCreation } from '../helpers/route-helpers';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

const ServiceTopPage = () => {
  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h2" component="h1" gutterBottom>
        GatherQuiz
      </Typography>
      <Typography variant="h5" component="h2" color="textSecondary" paragraph>
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
