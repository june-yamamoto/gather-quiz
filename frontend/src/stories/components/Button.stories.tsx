import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/design-system/Button/Button';
import { mobile } from '../fixtures';
import { fn } from '@storybook/test';

const meta = {
  title: 'コンポーネント/Button', component: Button,
  args: { children: '大会を作成する', variant: 'contained', onClick: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 720, padding: 24 }}><Story /></div>],
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
export const Secondary: Story = { args: { variant: 'outlined', children: 'ルールを確認' } };
export const Disabled: Story = { args: { disabled: true } };
export const Warning: Story = { args: { color: 'warning' } };
