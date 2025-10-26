import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuizCreatorPage from '../pages/QuizCreatorPage';
import { quizApiClient } from '../api/QuizApiClient';
import { Quiz } from '../models/Quiz';

vi.mock('../api/QuizApiClient');

const queryClient = new QueryClient();

const renderWithProviders = () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/tournaments/t-id/participants/p-id/quizzes/create']}>
        <Routes>
          <Route
            path="/tournaments/:tournamentId/participants/:participantId/quizzes/create"
            element={<QuizCreatorPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('QuizCreatorPage', () => {
  it('クイズ作成フォームが正しく表示されること', () => {
    renderWithProviders();
    expect(screen.getByRole('heading', { name: '問題作成・編集' })).toBeInTheDocument();
    expect(screen.getByLabelText('問題文')).toBeInTheDocument();
    expect(screen.getByLabelText('解答文')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'この内容で問題を保存する' })).toBeInTheDocument();
  });

  it('フォームを送信するとクイズ作成APIが呼ばれること', async () => {
    const createMock = vi.spyOn(quizApiClient, 'create').mockResolvedValue(
      new Quiz({
        id: 'new-quiz',
        point: 0,
        tournamentId: 't-id',
        participantId: 'p-id',
      })
    );
    renderWithProviders();

    fireEvent.change(screen.getByLabelText('問題文'), { target: { value: 'Test Question' } });
    fireEvent.click(screen.getByRole('button', { name: 'この内容で問題を保存する' }));

    await vi.waitFor(() => {
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          questionText: 'Test Question',
        })
      );
    });
  });
});
