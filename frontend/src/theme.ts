import { createTheme, alpha } from '@mui/material/styles';

/** 大会の準備から投影画面まで、色・余白・操作サイズを共有する。 */
export const theme = createTheme({
  palette: {
    primary: { main: '#205649', dark: '#133D33', light: '#E4EFE9' },
    secondary: { main: '#A65029', dark: '#783719', light: '#F9EADF' },
    info: { main: '#3D6476' },
    warning: { main: '#88602D' },
    success: { main: '#32634F' },
    error: { main: '#B3453C' },
    background: { default: '#F6F5F0', paper: '#FFFFFF' },
    text: { primary: '#233B34', secondary: '#64716B' },
    divider: '#DCE2DA',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Noto Sans JP", "Yu Gothic", "Hiragino Kaku Gothic ProN", system-ui, sans-serif',
    h1: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.25 },
    h2: { fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.035em' },
    h3: { fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.025em' },
    h4: { fontSize: 'clamp(1.35rem, 2.5vw, 1.8rem)', fontWeight: 750, lineHeight: 1.4 },
    h5: { fontSize: '1.2rem', fontWeight: 750, lineHeight: 1.5 },
    h6: { fontSize: '1rem', fontWeight: 750, lineHeight: 1.5 },
    body1: { lineHeight: 1.8 },
    body2: { lineHeight: 1.7 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.015em' },
  },
  components: {
    MuiCssBaseline: { styleOverrides: {
      body: { margin: 0 },
      '*, *::before, *::after': { boxSizing: 'border-box' },
      '::selection': { background: '#D5E9DE' },
      ':focus-visible': { outline: '3px solid #A65029', outlineOffset: 3 },
      'input, textarea, select': { scrollMarginTop: 24 },
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': { animation: 'none !important', transition: 'none !important', scrollBehavior: 'auto !important' },
      },
    } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 44, borderRadius: 10, padding: '10px 20px', gap: 6 },
        sizeSmall: { padding: '7px 12px', minHeight: 44 },
        sizeLarge: { minHeight: 52, padding: '13px 26px' },
        outlined: { borderColor: '#B7C9BF', '&:hover': { backgroundColor: '#EAF0EB' } },
      },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiOutlinedInput: { styleOverrides: {
      root: ({ theme }) => ({ backgroundColor: theme.palette.background.paper, borderRadius: 10,
        '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}` },
        '& fieldset': { borderColor: '#BCCAC2' } }),
      input: { fontSize: 16, lineHeight: 1.6, padding: '15px 14px' },
      inputMultiline: { padding: 0 },
    } },
    MuiInputLabel: { styleOverrides: { root: { fontSize: 16 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 650 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20, padding: 8 }, paperFullScreen: { borderRadius: 0, padding: 0 } } },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 750 } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px', gap: 8, flexWrap: 'wrap' } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none', backgroundColor: '#F6F5F0' } } },
    MuiTypography: { styleOverrides: { root: { overflowWrap: 'anywhere' } } },
    MuiTableCell: { styleOverrides: { root: { padding: '18px 20px' }, head: { color: '#64716B', fontSize: 12, letterSpacing: '0.05em' } } },
  },
});
