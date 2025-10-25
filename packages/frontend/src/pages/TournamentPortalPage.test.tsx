import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TournamentPortalPage from './TournamentPortalPage';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { Tournament } from '../models/Tournament';

describe('大会ポータルページ', () => {
  it('ログインモーダルを開き、ログインを試み、成功時に画面遷移すること', async () => {
    const mockTournament = new Tournament({
      id: 'test-id',
      name: 'Test Tournament',
      questionsPerParticipant: 5,
      points: '10,20,30,40,50',
      status: 'pending',
      participants: [],
    });

    const getTournamentSpy = vi.spyOn(tournamentApiClient, 'get').mockResolvedValue(mockTournament);
    const loginSpy = vi.spyOn(tournamentApiClient, 'login').mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={['/tournaments/test-id']}>
        <Routes>
          <Route path="/tournaments/:id" element={<TournamentPortalPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '主催者としてログイン' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('管理用パスワード')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('管理用パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(getTournamentSpy).toHaveBeenCalledWith('test-id');
      expect(loginSpy).toHaveBeenCalledWith('test-id', 'password123');
    });
  });
});
