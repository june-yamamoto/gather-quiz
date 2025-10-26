import type { Meta, StoryObj } from '@storybook/react';
import AnswerDisplayPage from '../../pages/AnswerDisplayPage';

const meta: Meta<typeof AnswerDisplayPage> = {
  title: '画面/解答表示ページ',
  component: AnswerDisplayPage,
  parameters: {
    reactRouter: {
      route: '/quizzes/:quizId/answer',
      path: '/quizzes/test-answer-id/answer',
    },
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
