import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * ヘッダー、フッターを含む共通レイアウトコンポーネント
 */
export const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
};
