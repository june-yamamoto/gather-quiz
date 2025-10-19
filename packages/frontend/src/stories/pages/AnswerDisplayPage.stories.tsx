import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AnswerDisplayPage from '../../pages/AnswerDisplayPage';

const meta: Meta<typeof AnswerDisplayPage> = {
  title: '画面/解答表示ページ',
  component: AnswerDisplayPage,
  parameters: {
    mockData: [
      {
        url: '/api/quizzes/test-answer-id',
        method: 'GET',
        status: 200,
        response: {
          id: 'test-answer-id',
          point: 30,
          questionText: 'これは問題文です。',
          answerText: 'これが解答です。',
          tournamentId: 'test-tourney-id',
        },
      },
    ],
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/quizzes/test-answer-id/answer']}>
        <Routes>
          <Route path="/quizzes/:quizId/answer" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
