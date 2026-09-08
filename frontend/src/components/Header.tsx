import { AppBar, Toolbar, Typography, Link, Box } from '@mui/material';
import { pathToServiceTop } from '../helpers/route-helpers';
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
      <Toolbar sx={{ width: '100%', maxWidth: 1200, mx: 'auto', gap: 2, minHeight: { sm: 64 } }}>
        <Box aria-hidden sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'white', borderRadius: '10px 10px 10px 2px', display: 'grid', placeItems: 'center', fontWeight: 800 }}>G</Box>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link component={RouterLink} to={pathToServiceTop()} color="inherit" underline="none" sx={{ fontWeight: 800, letterSpacing: '-0.04em', fontSize: 22 }}>
            GatherQuiz
          </Link>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>みんなの問いを、ひとつの大会に。</Typography>
      </Toolbar>
    </AppBar>
  );
};
