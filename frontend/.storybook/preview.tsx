import type { Preview } from '@storybook/react';
import { Title, Description, Stories, useOf } from '@storybook/addon-docs/blocks';
import { initialize, mswLoader, getWorker } from 'msw-storybook-addon';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useState, useMemo, useLayoutEffect } from 'react';
import { CssBaseline } from '@mui/material';
import type { PropsWithChildren } from 'react';
import type { RequestHandler } from 'msw';
import { createMockApi, type MockScenario } from '../src/stories/mock-api';
import App from '../src/App';
import { Layout } from '../src/components/Layout';
import { theme } from '../src/theme';

// Initialize MSW
initialize({
  onUnhandledRequest(request, print) {
    if (new URL(request.url).pathname.startsWith('/api/')) print.error();
  },
  serviceWorker: {
    // GitHub Pagesでサブディレクトリにデプロイされるため、
    // Service Workerのパスを環境変数から動的に設定する
    url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
  },
});

/** Story間のキャッシュ混入を防ぎ、失敗・読み込み状態を再現可能にする。 */
const StoryProviders = ({ children, snapshot, scenario, handlers }: PropsWithChildren<{ snapshot: string; scenario: MockScenario; handlers?: RequestHandler[] }>) => {
  const runtime = useMemo(() => ({
    ...createMockApi(JSON.parse(snapshot), scenario),
    client: new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false }, mutations: { retry: false } } }),
  }), [snapshot, scenario]);
  const [active, setActive] = useState<typeof runtime | null>(null);
  useLayoutEffect(() => {
    // 子画面のqueryより先に、Controlsと状態に対応するハンドラーへ置き換える。
    getWorker().resetHandlers(...(handlers || []), ...runtime.handlers);
    setActive(runtime);
    return () => { runtime.client.clear(); };
  }, [runtime, handlers]);
  if (active !== runtime) return null;
  return <QueryClientProvider client={runtime.client}><ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider></QueryClientProvider>;
};

/** 分離したDocsの表示と、即時反映できるCanvasの編集導線を提供する。 */
const DocsPage = () => {
  const { story } = useOf('story', ['story']);
  return <><Title /><Description /><p>内容を変更するには、<a href={`${import.meta.env.BASE_URL}?path=/story/${encodeURIComponent(story.id)}`} target="_top">CanvasのControlsを開く</a>か、左側から各Storyを選んでください。</p><Stories includePrimary /></>;
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    docs: { page: DocsPage, story: { inline: false, height: 600 } },
    viewport: { viewports: {
      mobile: { name: 'スマートフォン 375px', styles: { width: '375px', height: '812px' }, type: 'mobile' },
      smallMobile: { name: '小型スマートフォン 320px', styles: { width: '320px', height: '700px' }, type: 'mobile' },
      desktop: { name: 'デスクトップ', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
    } },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
  decorators: [
    (Story, context) => {
      const route = context.parameters.route || { path: '*', entry: '/' };
      return <StoryProviders key={context.id} snapshot={JSON.stringify(context.args)} scenario={context.parameters.mockScenario || 'normal'} handlers={context.parameters.msw?.handlers}>
        <div data-story-id={context.id} style={{ display: 'contents' }}>
        <MemoryRouter initialEntries={[{ pathname: route.entry.split('?')[0], search: route.entry.split('?')[1] || '', state: route.state }]}>
          <Routes>
            {context.parameters.page ? <Route element={<Layout />}><Route path={route.path} element={<Story />} /></Route> : <Route path={route.path} element={<Story />} />}
            {route.path !== '*' && <Route path="*" element={<App />} />}
          </Routes>
        </MemoryRouter>
        </div>
      </StoryProviders>;
    },
  ],
  tags: ['autodocs'],
};

export default preview;
