import { createTheme } from '@mui/material/styles';

// アプリケーションのカスタムテーマを定義
export const theme = createTheme({
  palette: {
    primary: {
      main: '#00529B', // 落ち着いた青色
    },
    secondary: {
      main: '#FFC107', // アクセントとなる黄色
    },
    background: {
      default: '#f5f5f5', // 薄いグレー
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
