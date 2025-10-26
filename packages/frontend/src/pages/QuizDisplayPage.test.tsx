import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuizDisplayPage from '../pages/QuizDisplayPage';
import { quizApiClient } from '../api/QuizApiClient';
import { Quiz } from '../models/Quiz';

vi.mock('../api/QuizApiClient');

const queryClient = new QueryClient();

const mockQuiz = new Quiz({
  id: 'q-1',
  point: 30,
  questionText: 'This is a test question.',
  questionImage: null,
  questionLink: null,
  answerText: 'Answer',
  answerImage: null,
  answerLink: null,
  tournamentId: 't-1',
  participantId: 'p-1',
});

const renderWithProviders = () => {
  vi.spyOn(quizApiClient, 'get').mockResolvedValue(mockQuiz);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/quizzes/q-1']}>
        <Routes>
          <Route path="/quizzes/:quizId" element={<QuizDisplayPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('QuizDisplayPage', () => {
  it('クイズ問題が正しく表示されること', async () => {
    renderWithProviders();
    await screen.findByText('30点問題');
    expect(await screen.findByText(/This is a test question/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '正解を見る' })).toBeInTheDocument();
  });
});
