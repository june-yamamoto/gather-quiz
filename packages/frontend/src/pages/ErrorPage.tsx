import { Button, Container, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const StyledContainer = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
}));

const ErrorPage = () => {
  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h2" component="h1" gutterBottom>
        エラーが発生しました
      </Typography>
      <Typography variant="h5" color="textSecondary" paragraph>
        お探しのページが見つからないか、一時的にアクセスできない状態です。
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button component={Link} to="/" variant="contained" color="primary" size="large">
          トップページに戻る
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default ErrorPage;
