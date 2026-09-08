import type { Meta, StoryObj } from '@storybook/react';
import { QuizCard } from '../../components/design-system/QuizCard/QuizCard';
import { mobile } from '../fixtures';
import { fn } from '@storybook/test';

const meta = {
  title: 'コンポーネント/QuizCard', component: QuizCard,
  args: { point: 30, genre: '旅と暮らし', onClick: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 720, padding: 24 }}><Story /></div>],
} satisfies Meta<typeof QuizCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
export const Opened: Story = { args: { isAnswered: true } };
export const Uncreated: Story = { args: { isUncreated: true, onClick: undefined } };
export const LongGenre: Story = { args: { genre: 'とても長いジャンル名が設定されている場合' } };
