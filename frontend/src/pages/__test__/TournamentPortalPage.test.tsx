import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TournamentPortalPage from '../TournamentPortalPage';
import { tournamentApiClient } from '../../api/TournamentApiClient';
import { Tournament } from '../../models/Tournament';
import { ApiError } from '../../errors/ApiError';

describe('大会ポータルページ', () => {
  beforeEach(() => {
    vi.spyOn(tournamentApiClient, 'getStatus').mockResolvedValue({ tournamentName: '大会', status: 'preparing', participants: [] });
  });
  it('参加者の試行制限を再試行時刻の案内として表示する', async () => {
    vi.spyOn(tournamentApiClient, 'get').mockResolvedValue(new Tournament({ id: 'test-id', name: '大会', points: '10', questionsPerParticipant: 1, status: 'pending', createdAt: new Date(), participants: [] }));
    const message = 'ログイン試行回数の上限です。15分後に再試行してください。';
    vi.spyOn(tournamentApiClient, 'loginParticipant').mockRejectedValue(new ApiError(message, 429));
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<MemoryRouter initialEntries={['/tournaments/test-id']}><Routes><Route path="/tournaments/:id" element={<TournamentPortalPage />} /></Routes></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: '参加者としてログイン' }));
    fireEvent.change(screen.getByLabelText('ID'), { target: { value: 'aoi' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    await waitFor(() => expect(alert).toHaveBeenCalledWith(message));
    vi.restoreAllMocks();
  });
  it('ログインモーダルを開き、ログインを試み、成功時に画面遷移すること', async () => {
    const mockTournament = new Tournament({
      id: 'test-id',
      name: 'Test Tournament',
      questionsPerParticipant: 5,
      points: '10,20,30,40,50',
      status: 'pending',
      createdAt: new Date(),
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
