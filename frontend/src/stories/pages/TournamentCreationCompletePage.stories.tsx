import { quizArgs, quizArgTypes, tournamentArgs, tournamentArgTypes, type QuizControls, type TournamentControls } from '../controls';
import type { Meta, StoryObj } from '@storybook/react';
import TournamentCreationCompletePage from '../../pages/TournamentCreationCompletePage';
import { pathToTournamentCreationComplete } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs, ...tournamentArgs },
  argTypes: { ...quizArgTypes, ...tournamentArgTypes },
  render: () => <TournamentCreationCompletePage />,
  title: '画面/主催者/大会作成完了',
  parameters: { page: true, route: { path: pathToTournamentCreationComplete(':id'), entry: pathToTournamentCreationComplete('t-1') } },
} satisfies Meta<QuizControls & TournamentControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const WithPassword: Story = { name: '作成直後', parameters: { route: { path: pathToTournamentCreationComplete(':id'), entry: pathToTournamentCreationComplete('t-1'), state: { password: 'demo-only' } } } };
