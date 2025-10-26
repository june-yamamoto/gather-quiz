import type { Meta, StoryObj } from '@storybook/react';
import TournamentPortalPage from '../../pages/TournamentPortalPage';

const meta: Meta<typeof TournamentPortalPage> = {
  title: '画面/主催者/大会ポータルページ',
  component: TournamentPortalPage,
  parameters: {
    reactRouter: {
      route: '/tournaments/:id',
      path: '/tournaments/test-portal-id',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
