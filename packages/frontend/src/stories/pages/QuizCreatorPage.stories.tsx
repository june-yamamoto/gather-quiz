import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import QuizCreatorPage from '../../pages/QuizCreatorPage';

const meta: Meta<typeof QuizCreatorPage> = {
  title: '画面/問題作成・編集ページ',
  component: QuizCreatorPage,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/tournaments/test-quiz-id/quizzes/new']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/quizzes/new" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
