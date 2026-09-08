import { quizArgs, quizArgTypes, tournamentArgs, tournamentArgTypes, type QuizControls, type TournamentControls } from '../controls';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import TournamentPortalPage from '../../pages/TournamentPortalPage';
import { pathToTournamentPortal } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs, ...tournamentArgs },
  argTypes: { ...quizArgTypes, ...tournamentArgTypes },
  render: () => <TournamentPortalPage />,
  title: '画面/大会ポータル',
  parameters: { page: true, route: { path: pathToTournamentPortal(':id'), entry: pathToTournamentPortal('t-1') } },
} satisfies Meta<QuizControls & TournamentControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const ParticipantLogin: Story = { name: '参加者ログイン', parameters: mobile,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '参加者としてログイン' }));
    await expect(within(document.body).getByRole('dialog')).toBeVisible();
  },
};
export const OrganizerLogin: Story = { name: '主催者ログイン',
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: '主催者としてログイン' }));
    await expect(within(document.body).getByRole('dialog')).toBeVisible();
  },
};
