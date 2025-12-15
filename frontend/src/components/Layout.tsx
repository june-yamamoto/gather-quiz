import { Box, Container } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * ヘッダー、フッターを含む共通レイアウトコンポーネント
 */
export const Layout = () => {
  const location = useLocation();
  const path = location.pathname;

  // ヘッダー・フッターを非表示にするパスの条件
  // 1. 問題ボード画面 (/tournaments/:id/board)
  // 2. 問題表示画面・解答表示画面 (/quizzes/...)
  const isImmersiveMode = path.includes('/board') || path.includes('/quizzes/');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isImmersiveMode && <Header />}
      <Container component="main" sx={{ flex: 1, ...(isImmersiveMode && { maxWidth: 'none !important', padding: '0 !important', margin: 0 }) }}>
        <Outlet />
      </Container>
      {!isImmersiveMode && <Footer />}
    </Box>
  );
};
