import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrganizerDashboardPage from './OrganizerDashboardPage';

describe('主催者ダッシュボードページ', () => {
  const mockData = {
    tournamentName: 'マイテスト大会',
    participants: [
      { id: '1', name: 'アリス', created: 2, required: 3 },
      { id: '2', name: 'ボブ', created: 3, required: 3 },
    ],
  };

  it('大会ステータスを正しく取得して表示すること', async () => {
    // Mock the global fetch function
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(
      <MemoryRouter initialEntries={['/tournaments/test-id/admin']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/admin" element={<OrganizerDashboardPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the API call and rendering to complete
    await waitFor(() => {
      expect(screen.getByText(`管理ページ: ${mockData.tournamentName}`)).toBeInTheDocument();
    });

    // Check if participant data is rendered correctly
    expect(screen.getByText('アリス')).toBeInTheDocument();
    expect(screen.getByText('2 / 3 問')).toBeInTheDocument();
    expect(screen.getByText('ボブ')).toBeInTheDocument();
    expect(screen.getByText('3 / 3 問')).toBeInTheDocument();

    // Check if the API was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith('/api/tournaments/test-id/status');
  });
});
