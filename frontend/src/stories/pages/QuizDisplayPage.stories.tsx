import type { Meta, StoryObj } from '@storybook/react';
import QuizDisplayPage from '../../pages/QuizDisplayPage';

const meta: Meta<typeof QuizDisplayPage> = {
  title: '画面/大会実施/問題表示ページ',
  component: QuizDisplayPage,
  parameters: {
    reactRouter: {
      route: '/quizzes/:quizId',
      path: '/quizzes/test-quiz-id',
    },
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
