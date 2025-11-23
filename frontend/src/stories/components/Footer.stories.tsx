import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from '../../components/Footer';

const meta: Meta<typeof Footer> = {
  title: 'コンポーネント/フッター',
  component: Footer,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
