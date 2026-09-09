import type { Meta, StoryObj } from '@storybook/react';
import { GettingStarted } from '../../components/GettingStarted';
import { mobile } from '../fixtures';
const meta = { title: 'コンポーネント/GettingStarted', component: GettingStarted } satisfies Meta<typeof GettingStarted>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
