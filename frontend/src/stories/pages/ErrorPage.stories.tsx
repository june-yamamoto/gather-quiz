import type { Meta, StoryObj } from '@storybook/react';
import ErrorPage from '../../pages/ErrorPage';
import { mobile } from '../fixtures';

const meta = {
  title: '画面/エラー', component: ErrorPage,
  parameters: { page: true, route: { path: '*', entry: '/missing' } },
} satisfies Meta<typeof ErrorPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
