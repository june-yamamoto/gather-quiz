import type { Meta, StoryObj } from '@storybook/react';
import ServiceTopPage from '../../pages/ServiceTopPage';
import { pathToServiceTop } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  title: '画面/サービスTOP', component: ServiceTopPage,
  parameters: { page: true, route: { path: pathToServiceTop(), entry: pathToServiceTop() } },
} satisfies Meta<typeof ServiceTopPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
