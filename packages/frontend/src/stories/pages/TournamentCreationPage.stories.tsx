import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TournamentCreationPage from '../../pages/TournamentCreationPage';

const meta: Meta<typeof TournamentCreationPage> = {
  title: '画面/大会作成・編集ページ',
  component: TournamentCreationPage,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  name: '作成モード',
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/tournaments/new']}>
        <Routes>
          <Route path="/tournaments/new" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export const EditMode: Story = {
  name: '編集モード',
  parameters: {
    mockData: [
      {
        url: '/api/tournaments/test-edit-id',
        method: 'GET',
        status: 200,
        response: {
          id: 'test-edit-id',
          name: '編集中の大会',
          questionsPerParticipant: 5,
          points: '10,20,30,40,50',
          regulation: 'これは編集用の既存レギュレーションです。',
        },
      },
    ],
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/tournaments/test-edit-id/edit']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/edit" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};
