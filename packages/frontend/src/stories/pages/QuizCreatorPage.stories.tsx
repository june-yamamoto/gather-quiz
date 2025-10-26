import type { Meta, StoryObj } from '@storybook/react';
import QuizCreatorPage from '../../pages/QuizCreatorPage';

const meta: Meta<typeof QuizCreatorPage> = {
  title: '画面/参加者/問題作成・編集ページ',
  component: QuizCreatorPage,
  parameters: {
    reactRouter: {
      route: '/tournaments/:tournamentId/quizzes/new',
      path: '/tournaments/test-quiz-id/quizzes/new',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
