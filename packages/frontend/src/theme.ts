import { createTheme } from '@mui/material/styles';

// アプリケーションのカスタムテーマを定義
export const theme = createTheme({
  palette: {
    primary: {
      main: '#00529B', // プライマリカラー（青）
    },
    secondary: {
      main: '#0D8E53', // アクションカラー（緑）
    },
    background: {
      default: '#FFFFFF', // 背景色（白）
    },
    text: {
      primary: '#1A1A1A', // テキストカラー
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 700,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // 角を少し丸くする
          textTransform: 'none', // ボタンのテキストを大文字にしない
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // ヘッダーの影をなくす
        },
      },
    },
  },
});
