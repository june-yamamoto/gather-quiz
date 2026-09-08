import type { Meta, StoryObj } from '@storybook/react';
import { ExpandableQuizImage } from '../../components/ExpandableQuizImage';
import { imageFixture, mobile } from '../fixtures';

const meta = {
  title: 'コンポーネント/ExpandableQuizImage',
  component: ExpandableQuizImage,
  args: { src: imageFixture, alt: '問題画像' },
  argTypes: { src: { control: 'text' }, alt: { control: 'text' } },
} satisfies Meta<typeof ExpandableQuizImage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
