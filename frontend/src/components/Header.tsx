import { AppBar, Toolbar, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * アプリケーションのヘッダーコンポーネント
 */
export const Header = () => {
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="none" sx={{ fontWeight: 'bold' }}>
            GatherQuiz
          </Link>
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
