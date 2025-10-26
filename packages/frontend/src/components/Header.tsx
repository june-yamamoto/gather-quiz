import { AppBar, Toolbar, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * アプリケーションのヘッダーコンポーネント
 */
export const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="none">
            GatherQuiz
          </Link>
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
