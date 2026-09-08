import { quizArgs, quizArgTypes, tournamentArgs, tournamentArgTypes, type QuizControls, type TournamentControls } from '../controls';
import type { Meta, StoryObj } from '@storybook/react';
import OrganizerDashboardPage from '../../pages/OrganizerDashboardPage';
import { pathToOrganizerDashboard } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs, ...tournamentArgs },
  argTypes: { ...quizArgTypes, ...tournamentArgTypes },
  render: () => <OrganizerDashboardPage />,
  title: '画面/主催者/管理',
  parameters: { page: true, route: { path: pathToOrganizerDashboard(':tournamentId'), entry: pathToOrganizerDashboard('t-1') } },
} satisfies Meta<QuizControls & TournamentControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const Loading: Story = { name: '読み込み中', parameters: { mockScenario: 'loading' } };
export const Failure: Story = { name: '取得失敗', parameters: { mockScenario: 'error' } };
