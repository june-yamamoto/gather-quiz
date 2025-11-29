import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnswerDisplayPage from '../pages/AnswerDisplayPage';
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
  answerText: 'This is the answer.',
  answerImage: 'http://example.com/answer.png',
  answerLink: 'http://example.com/answer',
  tournamentId: 't-1',
  participantId: 'p-1',
});

const renderWithProviders = () => {
  vi.spyOn(quizApiClient, 'get').mockResolvedValue(mockQuiz);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/quizzes/q-1/answer']}>
        <Routes>
          <Route path="/quizzes/:quizId/answer" element={<AnswerDisplayPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AnswerDisplayPage', () => {
  it('クイズの解答が正しく表示されること', async () => {
    renderWithProviders();
    await screen.findByText(/Q. This is a test question./);
    expect(screen.getByText('A. This is the answer.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '解答画像' })).toHaveAttribute('src', 'http://example.com/answer.png');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'http://example.com/answer');
    expect(screen.getByRole('button', { name: 'ボードに戻る' })).toBeInTheDocument();
  });
});