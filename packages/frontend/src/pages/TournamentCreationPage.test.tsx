import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TournamentCreationPage from '../pages/TournamentCreationPage';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { Tournament } from '../models/Tournament';

// APIクライアントをモック
vi.mock('../api/TournamentApiClient');

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/create']}>
        <Routes>
          <Route path="/create" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('TournamentCreationPage', () => {
  it('新規作成モードでページが正しくレンダリングされること', () => {
    renderWithProviders(<TournamentCreationPage />);
    expect(screen.getByRole('heading', { name: '新しいクイズ大会を作成' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '大会名' })).toBeInTheDocument();
  });

  it('フォームを送信すると大会作成APIが呼ばれること', async () => {
    const createMock = vi
      .spyOn(tournamentApiClient, 'create')
      .mockResolvedValue(
        new Tournament({
          id: 'new-id',
          name: 'Test Tournament',
          questionsPerParticipant: 0,
          points: '',
          status: 'pending',
          participants: [],
        })
      );
    const { container } = renderWithProviders(<TournamentCreationPage />);

    fireEvent.change(screen.getByRole('textbox', { name: '大会名' }), { target: { value: 'Test Tournament' } });
    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }
    fireEvent.click(screen.getByRole('button', { name: 'この内容で大会を作成する' }));

    await vi.waitFor(() => {
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Tournament',
          password: 'password',
        })
      );
    });
  });
});
