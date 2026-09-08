import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../../components/design-system/Card/Card';
import { mobile } from '../fixtures';

const meta = {
  title: 'コンポーネント/Card', component: Card,
  args: { children: 'みんなの問題を持ち寄ろう' },
  decorators: [(Story) => <div style={{ maxWidth: 720, padding: 24 }}><Story /></div>],
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
