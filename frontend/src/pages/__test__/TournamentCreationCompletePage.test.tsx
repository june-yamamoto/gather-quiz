import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TournamentCreationCompletePage from '../TournamentCreationCompletePage';
import { tournamentApiClient } from '../../api/TournamentApiClient';
import { Tournament } from '../../models/Tournament';

vi.mock('../../api/TournamentApiClient');

const queryClient = new QueryClient();

describe('TournamentCreationCompletePage', () => {
  it('作成完了メッセージとポータルへのリンクが表示されること', async () => {
    const tournamentId = 'test-tournament-id';
    const password = 'test-password';

    vi.spyOn(tournamentApiClient, 'get').mockResolvedValue(
      new Tournament({
        id: tournamentId,
        name: 'New Tournament',
        questionsPerParticipant: 3,
        points: '10,20,30',
        regulation: '',
        status: 'pending',
        createdAt: new Date(),
        participants: [],
      })
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: `/tournaments/${tournamentId}/complete`,
              state: { password: password },
            },
          ]}
        >
          <Routes>
            <Route path="/tournaments/:tournamentId/complete" element={<TournamentCreationCompletePage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'クイズ大会の作成が完了しました！' })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: '大会ポータルへ移動' })).toBeInTheDocument();
  });
});
