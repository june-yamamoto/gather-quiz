import type { Meta, StoryObj } from '@storybook/react';
import { QuizMedia } from '../../components/QuizMedia';

const meta = {
  title: 'コンポーネント/QuizMedia', component: QuizMedia,
  args: { label: '問題メディア', url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE' },
} satisfies Meta<typeof QuizMedia>;
export default meta;
type Story = StoryObj<typeof meta>;
export const YouTube: Story = {};
export const Video: Story = { args: { url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' } };
export const Audio: Story = { args: { url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg' } };
export const Link: Story = { args: { url: 'https://example.com/' } };
export const InvalidUrl: Story = { args: { url: 'javascript:alert(1)' } };
export const LoadFailure: Story = { args: { url: 'https://example.invalid/missing.mp4' } };
