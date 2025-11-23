import { Box, Container, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * アプリケーションのフッターコンポーネント
 */
export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[50],
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Link component={RouterLink} to="/terms" variant="body2" color="text.secondary" sx={{ mx: 1.5 }}>
            利用規約
          </Link>
          <Link component={RouterLink} to="/privacy" variant="body2" color="text.secondary" sx={{ mx: 1.5 }}>
            プライバシーポリシー
          </Link>
          <Link component={RouterLink} to="/contact" variant="body2" color="text.secondary" sx={{ mx: 1.5 }}>
            お問い合わせ
          </Link>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()} GatherQuiz Project.
        </Typography>
      </Container>
    </Box>
  );
};
