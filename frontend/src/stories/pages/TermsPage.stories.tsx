import type { Meta, StoryObj } from '@storybook/react';
import TermsPage from '../../pages/TermsPage';
import { mobile } from '../fixtures';

const meta = {
  title: '画面/利用規約', component: TermsPage,
  parameters: { page: true, route: { path: '*', entry: '/terms' } },
} satisfies Meta<typeof TermsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
