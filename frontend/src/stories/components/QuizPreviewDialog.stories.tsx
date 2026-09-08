import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@mui/material';
import { QuizPreviewDialog } from '../../components/QuizPreviewDialog';
import { mobile, imageFixture } from '../fixtures';
import { quizArgs, quizArgTypes, type QuizControls } from '../controls';

type Args = QuizControls & { mode: 'question' | 'answer' };
/** 閉じた後も再表示できる操作付きプレビュー。 */
const Preview = (args: Args) => {
  const [open, setOpen] = useState(true);
  return <><Button onClick={() => setOpen(true)}>プレビューを開く</Button>
    <QuizPreviewDialog open={open} onClose={() => setOpen(false)} quizId="q-1" mode={args.mode} />
  </>;
};
const meta = {
  title: 'コンポーネント/QuizPreviewDialog',
  args: { ...quizArgs, mode: 'question' },
  argTypes: { ...quizArgTypes, mode: { control: 'inline-radio', options: ['question', 'answer'] } },
  render: (args) => <Preview {...args} />,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
export const Answer: Story = { name: '解答表示', args: { mode: 'answer' } };
export const WithImage: Story = { name: '画像付き', args: { questionText: quizArgs.questionText.repeat(20), questionImage: imageFixture, answerImage: imageFixture } };
export const LongText: Story = { name: '長文', args: { questionText: quizArgs.questionText.repeat(12) } };
