import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrganizerDashboardPage from './OrganizerDashboardPage';
import { tournamentApiClient } from '../api/TournamentApiClient';

describe('主催者ダッシュボードページ', () => {
  const mockData = {
    tournamentName: 'マイテスト大会',
    participants: [
      { id: '1', name: 'アリス', created: 2, required: 3, tournamentId: 'test-id', quizzes: [] },
      { id: '2', name: 'ボブ', created: 3, required: 3, tournamentId: 'test-id', quizzes: [] },
    ],
  };

  it('大会ステータスを正しく取得して表示すること', async () => {
    const getStatusSpy = vi.spyOn(tournamentApiClient, 'getStatus').mockResolvedValue(mockData);

    render(
      <MemoryRouter initialEntries={['/tournaments/test-id/admin']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/admin" element={<OrganizerDashboardPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('管理ページ: マイテスト大会')).toBeInTheDocument();
    });

    expect(screen.getByText('アリス')).toBeInTheDocument();
    expect(screen.getByText('2 / 3 問')).toBeInTheDocument();
    expect(screen.getByText('ボブ')).toBeInTheDocument();
    expect(screen.getByText('3 / 3 問')).toBeInTheDocument();

    expect(getStatusSpy).toHaveBeenCalledWith('test-id');
  });
});
