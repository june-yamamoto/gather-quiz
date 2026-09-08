import { quizArgs, quizArgTypes, type QuizControls } from '../controls';
import { imageFixture } from '../fixtures';
import type { Meta, StoryObj } from '@storybook/react';
import QuizDisplayPage from '../../pages/QuizDisplayPage';
import { pathToQuizDisplay } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs },
  argTypes: { ...quizArgTypes },
  render: () => <QuizDisplayPage />,
  title: '画面/大会実施/問題表示',
  parameters: { page: true, route: { path: pathToQuizDisplay(':quizId'), entry: pathToQuizDisplay('q-1') } },
} satisfies Meta<QuizControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const MultipleChoice: Story = { name: '音楽・4択問題', args: { label: '音楽', choiceCount: 4, choices: ['ピアノ', 'バイオリン', 'フルート', 'トランペット'], questionText: '次のうち、弦楽器はどれでしょう？', answerText: '2. バイオリン' } };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const Loading: Story = { name: '読み込み中', parameters: { mockScenario: 'loading' } };
export const Failure: Story = { name: '取得失敗', parameters: { mockScenario: 'error' } };
export const WithImage: Story = { name: '画像付き問題', args: { questionImage: imageFixture } };
export const SaveFailure: Story = { name: '既読保存失敗', parameters: { mockScenario: 'saveError' } };
