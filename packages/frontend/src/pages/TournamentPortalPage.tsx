import { Button, Container, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useParams } from 'react-router-dom';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

const TournamentPortalPage = () => {
  const { id } = useParams();

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        大会ポータル
      </Typography>
      <Typography variant="h6" color="textSecondary" paragraph>
        参加方法を選択してください
      </Typography>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" color="primary" size="large">
          主催者としてログイン
        </Button>
        <Button component={Link} to={`/tournaments/${id}/register`} variant="contained" color="primary" size="large">
          参加者として新規登録
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default TournamentPortalPage;