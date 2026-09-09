import type { Meta, StoryObj } from '@storybook/react';
import { AnswerDisplayContainer } from '../../components/AnswerDisplayContainer';
import { mobile, imageFixture } from '../fixtures';
import { quizArgs, quizArgTypes, controlledQuiz, type QuizControls } from '../controls';
import { fn } from '@storybook/test';

type Args = QuizControls & { showButton: boolean; buttonText: string; onButtonClick: () => void };
const meta = {
  title: 'コンポーネント/AnswerDisplayContainer',
  args: { ...quizArgs, showButton: true, buttonText: 'ボードに戻る', onButtonClick: fn() },
  argTypes: { ...quizArgTypes, showButton: { control: 'boolean' }, buttonText: { control: 'text' }, onButtonClick: { control: false } },
  render: ({ showButton, buttonText, onButtonClick, ...args }) => <AnswerDisplayContainer quiz={controlledQuiz(args)} showButton={showButton} buttonText={buttonText} onButtonClick={onButtonClick} />,
  decorators: [(Story) => <div style={{ height: '100dvh' }}><Story /></div>],
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
export const LongText: Story = { args: { answerText: quizArgs.answerText.repeat(20) } };
export const Preview: Story = { args: { showButton: false } };
export const WithImage: Story = { args: { answerText: quizArgs.answerText.repeat(20), answerImage: imageFixture } };

export const CorrectChoice: Story = { name: '正解の選択肢と解説', args: { choiceCount: 3, choices: ['ピアノ', 'バイオリン', 'フルート'], correctChoiceIndex: 1, answerText: 'バイオリンは弦を弓でこすって音を出す楽器です。' } };
export const CorrectChoiceMobile: Story = { ...CorrectChoice, name: '正解・長文・画像とスマートフォン', parameters: mobile, args: { ...CorrectChoice.args, answerText: '詳しい解説です。'.repeat(40), answerImage: imageFixture } };
