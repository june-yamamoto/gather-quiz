import type { Meta, StoryObj } from '@storybook/react';
import ErrorPage from '../../pages/ErrorPage';

const meta: Meta<typeof ErrorPage> = {
  title: '画面/エラーページ',
  component: ErrorPage,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
