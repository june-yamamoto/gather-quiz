import type { Meta, StoryObj } from '@storybook/react';
import { QuizDisplayContainer } from '../../components/QuizDisplayContainer';
import { mobile, imageFixture } from '../fixtures';
import { quizArgs, quizArgTypes, controlledQuiz, type QuizControls } from '../controls';
import { fn } from '@storybook/test';

type Args = QuizControls & { showButton: boolean; buttonText: string; onButtonClick: () => void };
const meta = {
  title: 'コンポーネント/QuizDisplayContainer',
  args: { ...quizArgs, showButton: true, buttonText: '正解を見る', onButtonClick: fn() },
  argTypes: { ...quizArgTypes, showButton: { control: 'boolean' }, buttonText: { control: 'text' }, onButtonClick: { control: false } },
  render: ({ showButton, buttonText, onButtonClick, ...args }) => <QuizDisplayContainer quiz={controlledQuiz(args)} showButton={showButton} buttonText={buttonText} onButtonClick={onButtonClick} />,
  decorators: [(Story) => <div style={{ height: '100dvh' }}><Story /></div>],
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
export const LongText: Story = { args: { questionText: quizArgs.questionText.repeat(20) } };
export const Preview: Story = { args: { showButton: false } };
export const WithImage: Story = { args: { questionText: quizArgs.questionText.repeat(20), questionImage: imageFixture } };
