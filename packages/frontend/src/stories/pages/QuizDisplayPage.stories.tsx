import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import QuizDisplayPage from '../../pages/QuizDisplayPage';

const meta: Meta<typeof QuizDisplayPage> = {
  title: '画面/問題表示ページ',
  component: QuizDisplayPage,
  parameters: {
    mockData: [
      {
        url: '/api/quizzes/test-quiz-id',
        method: 'GET',
        status: 200,
        response: {
          id: 'test-quiz-id',
          point: 50,
          questionText: 'これは50点問題の問題文です。',
        },
      },
    ],
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/quizzes/test-quiz-id']}>
        <Routes>
          <Route path="/quizzes/:quizId" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};