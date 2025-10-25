import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, FC } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const theme = createTheme();
// テストのタイムアウトを避けるため、リトライをオフにしたクライアントを作成
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// @testing-library/react からすべてを再エクスポート
export * from '@testing-library/react';

// render メソッドをオーバーライド
export { customRender as render };
