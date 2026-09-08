import { quizArgs, quizArgTypes, tournamentArgs, tournamentArgTypes, type QuizControls, type TournamentControls } from '../controls';
import type { Meta, StoryObj } from '@storybook/react';
import ParticipantDashboardPage from '../../pages/ParticipantDashboardPage';
import { pathToParticipantDashboard } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs, ...tournamentArgs },
  argTypes: { ...quizArgTypes, ...tournamentArgTypes },
  render: () => <ParticipantDashboardPage />,
  title: '画面/参加者/参加者ダッシュボード',
  parameters: { page: true, route: { path: pathToParticipantDashboard(':tournamentId', ':participantId'), entry: pathToParticipantDashboard('t-1', 'p-1') } },
} satisfies Meta<QuizControls & TournamentControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const Loading: Story = { name: '読み込み中', parameters: { mockScenario: 'loading' } };
export const Failure: Story = { name: '取得失敗', parameters: { mockScenario: 'error' } };
export const Empty: Story = { name: '未作成', parameters: { ...mobile, mockScenario: 'empty' } };
export const Complete: Story = { name: '全問作成済み', parameters: { ...mobile, mockScenario: 'complete' }, args: { participantName: 'とても長い名前の参加者あおい' } };
