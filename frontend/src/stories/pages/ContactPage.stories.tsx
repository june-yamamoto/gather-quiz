import type { Meta, StoryObj } from '@storybook/react';
import ContactPage from '../../pages/ContactPage';
import { mobile } from '../fixtures';

const meta = {
  title: '画面/お問い合わせ', component: ContactPage,
  parameters: { page: true, route: { path: '*', entry: '/contact' } },
} satisfies Meta<typeof ContactPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
