import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
  ],
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    // 未定義モックを実バックエンドにプロキシしない。
    config.server = { ...config.server, proxy: {} };
    // VITE_BASE_URL 環境変数に基づいて `base` を設定
    config.base = process.env.VITE_BASE_URL || config.base;
    // `define` を使ってクライアントサイドで環境変数を読めるようにする
    config.define = {
      ...config.define,
      'import.meta.env.BASE_URL': JSON.stringify(process.env.VITE_BASE_URL || '/'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api'),
    };
    return config;
  },
};
export default config;
