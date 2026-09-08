import { quizArgs, quizArgTypes, tournamentArgs, tournamentArgTypes, type QuizControls, type TournamentControls } from '../controls';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import QuizBoardPage from '../../pages/QuizBoardPage';
import { pathToQuizBoard } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs, ...tournamentArgs },
  argTypes: { ...quizArgTypes, ...tournamentArgTypes },
  render: () => <QuizBoardPage />,
  title: '画面/大会実施/問題ボード',
  parameters: { page: true, route: { path: pathToQuizBoard(':tournamentId'), entry: pathToQuizBoard('t-1') } },
} satisfies Meta<QuizControls & TournamentControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const Loading: Story = { name: '読み込み中', parameters: { mockScenario: 'loading' } };
export const Failure: Story = { name: '取得失敗', parameters: { mockScenario: 'error' } };
export const Finished: Story = {
  name: '大会終了ダイアログ',
  parameters: { mockScenario: 'finished' },
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole('button', { name: '大会を終了する！' }));
    await expect(within(document.body).getByRole('dialog')).toBeVisible();
  },
};
