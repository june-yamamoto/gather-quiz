import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TournamentCreationCompletePage from '../../pages/TournamentCreationCompletePage';

const meta: Meta<typeof TournamentCreationCompletePage> = {
  title: '画面/大会作成完了ページ',
  component: TournamentCreationCompletePage,
  parameters: {
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
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={[{
          pathname: '/tournaments/test-complete-id/created',
          state: { password: 'password123' },
        }]}
      >
        <Routes>
          <Route path="/tournaments/:id/created" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};