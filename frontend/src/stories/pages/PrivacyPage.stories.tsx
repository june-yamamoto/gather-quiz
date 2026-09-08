import type { Meta, StoryObj } from '@storybook/react';
import PrivacyPage from '../../pages/PrivacyPage';
import { mobile } from '../fixtures';

const meta = {
  title: '画面/プライバシーポリシー', component: PrivacyPage,
  parameters: { page: true, route: { path: '*', entry: '/privacy' } },
} satisfies Meta<typeof PrivacyPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
