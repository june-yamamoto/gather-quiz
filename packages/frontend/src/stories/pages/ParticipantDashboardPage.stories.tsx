import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ParticipantDashboardPage from '../../pages/ParticipantDashboardPage';

const meta: Meta<typeof ParticipantDashboardPage> = {
  title: '画面/参加者ダッシュボード',
  component: ParticipantDashboardPage,
  parameters: {
    mockData: [
      {
        url: '/api/participants/test-participant-id/quizzes',
        method: 'GET',
        status: 200,
        response: {
          createdQuizzes: [{ id: 'q1', question: '{"question":"これは最初の問題です"}', answer: '答え1' }],
          remainingQuestions: 2,
        },
      },
    ],
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/tournaments/test-tourney-id/participants/test-participant-id']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/participants/:participantId" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
