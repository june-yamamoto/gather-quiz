import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import OrganizerDashboardPage from '../../pages/OrganizerDashboardPage';

const meta: Meta<typeof OrganizerDashboardPage> = {
  title: '画面/主催者ダッシュボード',
  component: OrganizerDashboardPage,
  parameters: {
    mockData: [
      {
        url: '/api/tournaments/test-organizer-id/status',
        method: 'GET',
        status: 200,
        response: {
          tournamentName: '主催者ダッシュボードテスト大会',
          participants: [
            { id: 'p1', name: '田中', created: 3, required: 3 },
            { id: 'p2', name: '佐藤', created: 1, required: 3 },
          ],
        },
      },
    ],
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/tournaments/test-organizer-id/admin']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/admin" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
