import { quizArgs, quizArgTypes, type QuizControls } from '../controls';
import type { Meta, StoryObj } from '@storybook/react';
import AnswerDisplayPage from '../../pages/AnswerDisplayPage';
import { pathToAnswerDisplay } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs },
  argTypes: { ...quizArgTypes },
  render: () => <AnswerDisplayPage />,
  title: '画面/大会実施/解答表示',
  parameters: { page: true, route: { path: pathToAnswerDisplay(':quizId'), entry: pathToAnswerDisplay('q-1') } },
} satisfies Meta<QuizControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const Loading: Story = { name: '読み込み中', parameters: { mockScenario: 'loading' } };
export const Failure: Story = { name: '取得失敗', parameters: { mockScenario: 'error' } };
