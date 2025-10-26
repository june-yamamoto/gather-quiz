import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    'msw-storybook-addon',
    'storybook-addon-react-router-v6',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    // VITE_BASE_URL 環境変数に基づいて `base` を設定
    config.base = process.env.VITE_BASE_URL || config.base;
    // `define` を使ってクライアントサイドで環境変数を読めるようにする
    config.define = {
      ...config.define,
      'import.meta.env.BASE_URL': JSON.stringify(process.env.VITE_BASE_URL || '/'),
    };
    return config;
  },
};
export default config;
