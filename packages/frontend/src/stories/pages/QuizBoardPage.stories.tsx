import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import QuizBoardPage from '../../pages/QuizBoardPage';

const meta: Meta<typeof QuizBoardPage> = {
  title: '画面/問題選択ボードページ',
  component: QuizBoardPage,
  parameters: {
    mockData: [
      {
        url: '/api/tournaments/test-board-id/board',
        method: 'GET',
        status: 200,
        response: {
          name: 'クイズボードテスト大会',
          points: '10,20,30',
          participants: [
            {
              id: 'p1',
              name: '田中',
              quizzes: [{ id: 'q1', point: 10 }, { id: 'q2', point: 30 }],
            },
            {
              id: 'p2',
              name: '佐藤',
              quizzes: [{ id: 'q3', point: 20 }],
            },
          ],
        },
      },
    ],
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/tournaments/test-board-id/board']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/board" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};