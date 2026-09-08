import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuizDisplayPage from '../QuizDisplayPage';
import { quizApiClient } from '../../api/QuizApiClient';
import { Quiz } from '../../models/Quiz';

vi.mock('../../api/QuizApiClient');

const queryClient = new QueryClient();

const mockQuiz = new Quiz({
  id: 'q-1',
  point: 10,
  order: 0,
  isOpened: false,
  questionText: 'Test Question',
  questionImage: 'https://example.com/question.jpg',
  questionLink: 'https://example.com/hint',
  answerText: 'Answer',
  answerImage: null,
  answerLink: null,
  tournamentId: 't-1',
  participantId: 'p-1',
});

const renderWithProviders = (quiz = mockQuiz) => {
  vi.spyOn(quizApiClient, 'get').mockResolvedValue(quiz);

  return render(
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
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    vi.mocked(quizApiClient.markOpened).mockResolvedValue(new Quiz({ ...mockQuiz, isOpened: true }));
  });

  it('取得だけでは記録せず、問題画像が読み込まれてから対象の既読を記録する', async () => {
    renderWithProviders();
    const image = await screen.findByRole('img', { name: '問題画像' });
    expect(quizApiClient.markOpened).not.toHaveBeenCalled();
    fireEvent.load(image);
    await waitFor(() => expect(quizApiClient.markOpened).toHaveBeenCalledWith('q-1'));
    expect(quizApiClient.markOpened).toHaveBeenCalledTimes(1);
  });

  it('画像の読み込みが失敗した問題を既読にしない', async () => {
    renderWithProviders();
    fireEvent.error(await screen.findByRole('img', { name: '問題画像' }));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 80)); });
    expect(quizApiClient.markOpened).not.toHaveBeenCalled();
  });

  it('画像のない問題も描画後に記録し、ボードを再取得対象にする', async () => {
    queryClient.setQueryData(['tournament', 't-1', 'board'], { id: 't-1' });
    renderWithProviders(new Quiz({ ...mockQuiz, questionImage: null }));
    await screen.findByText(/Test Question/);
    await waitFor(() => expect(quizApiClient.markOpened).toHaveBeenCalledWith('q-1'));
    await waitFor(() => expect(queryClient.getQueryState(['tournament', 't-1', 'board'])?.isInvalidated).toBe(true));
  });

  it('描画待ちの間に離脱した問題は記録しない', async () => {
    const frame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    const view = renderWithProviders();
    fireEvent.load(await screen.findByRole('img', { name: '問題画像' }));
    view.unmount();
    expect(quizApiClient.markOpened).not.toHaveBeenCalled();
    frame.mockRestore();
  });

  it('非表示タブでは記録せず、表示された後に記録する', async () => {
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    renderWithProviders();
    fireEvent.load(await screen.findByRole('img', { name: '問題画像' }));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 80)); });
    expect(quizApiClient.markOpened).not.toHaveBeenCalled();
    visibility.mockReturnValue('visible');
    fireEvent(document, new Event('visibilitychange'));
    await waitFor(() => expect(quizApiClient.markOpened).toHaveBeenCalledWith('q-1'));
    visibility.mockRestore();
  });

  it('保存失敗を表示し、再試行できる', async () => {
    vi.mocked(quizApiClient.markOpened).mockRejectedValueOnce(new Error('通信エラー'));
    renderWithProviders();
    fireEvent.load(await screen.findByRole('img', { name: '問題画像' }));
    fireEvent.click(await screen.findByRole('button', { name: '既読保存を再試行' }));
    await waitFor(() => expect(quizApiClient.markOpened).toHaveBeenCalledTimes(2));
  });

  it('クイズ問題が正しく表示されること', async () => {
    renderWithProviders();
    await screen.findByText('10点問題');
    expect(await screen.findByText(/Test Question/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '問題画像' })).toHaveAttribute('src', 'https://example.com/question.jpg');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/hint');
    expect(screen.getByRole('button', { name: '正解を見る' })).toBeInTheDocument();
  });
});
