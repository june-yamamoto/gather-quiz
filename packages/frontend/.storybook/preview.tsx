import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { theme } from '../src/theme';

// Initialize MSW
initialize({
  serviceWorker: {
    // GitHub Pagesでサブディレクトリにデプロイされるため、
    // Service Workerのパスを環境変数から動的に設定する
    url: `${process.env.BASE_URL || ''}mockServiceWorker.js`,
  },
});

const queryClient = new QueryClient();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <Story />
          </ThemeProvider>
        </QueryClientProvider>
      </MemoryRouter>
    ),
  ],
  tags: ['autodocs'],
};

export default preview;
