import { quizArgs, quizArgTypes, tournamentArgs, tournamentArgTypes, type QuizControls, type TournamentControls } from '../controls';
import type { Meta, StoryObj } from '@storybook/react';
import QuizCreatorPage from '../../pages/QuizCreatorPage';
import { pathToQuizCreator } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs, ...tournamentArgs },
  argTypes: { ...quizArgTypes, ...tournamentArgTypes },
  render: () => <QuizCreatorPage />,
  title: '画面/参加者/問題作成',
  parameters: { page: true, route: { path: pathToQuizCreator(':tournamentId', ':participantId'), entry: pathToQuizCreator('t-1', 'p-1') + '?order=1&point=20' } },
} satisfies Meta<QuizControls & TournamentControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const Edit: Story = { name: '編集・スマートフォン', parameters: { ...mobile, route: { path: pathToQuizCreator(':tournamentId', ':participantId'), entry: pathToQuizCreator('t-1', 'p-1') + '?edit=q-1&order=0&point=10' } } };
