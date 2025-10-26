import type { Meta, StoryObj } from '@storybook/react';
import TournamentCreationCompletePage from '../../pages/TournamentCreationCompletePage';

const meta: Meta<typeof TournamentCreationCompletePage> = {
  title: '画面/主催者/大会作成完了ページ',
  component: TournamentCreationCompletePage,
  parameters: {
    reactRouter: {
      route: '/tournaments/:id/created',
      path: '/tournaments/test-complete-id/created',
      state: { password: 'password123' },
    },
    mockData: [
      {
        url: '/api/tournaments/test-complete-id',
        method: 'GET',
        status: 200,
        response: {
          id: 'test-complete-id',
          name: '作成完了した大会',
        },
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
