import { quizArgs, quizArgTypes, tournamentArgs, tournamentArgTypes, type QuizControls, type TournamentControls } from '../controls';
import type { Meta, StoryObj } from '@storybook/react';
import TournamentCreationPage from '../../pages/TournamentCreationPage';
import { pathToTournamentCreation, pathToTournamentEdit } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs, ...tournamentArgs },
  argTypes: { ...quizArgTypes, ...tournamentArgTypes },
  render: () => <TournamentCreationPage />,
  title: '画面/主催者/大会作成',
  parameters: { page: true, route: { path: pathToTournamentCreation(), entry: pathToTournamentCreation() } },
} satisfies Meta<QuizControls & TournamentControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const Edit: Story = { name: '編集', parameters: { route: { path: pathToTournamentEdit(':tournamentId'), entry: pathToTournamentEdit('t-1') } } };
