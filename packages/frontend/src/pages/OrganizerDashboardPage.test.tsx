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
    // fetchが呼ばれた際に、モックデータを返すように設定
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

    // API呼び出しと画面の再レンダリングが完了するまで待機
    await waitFor(() => {
      expect(screen.getByText(`管理ページ: ${mockData.tournamentName}`)).toBeInTheDocument();
    });

    // 参加者のデータが正しく画面に表示されているか検証
    expect(screen.getByText('アリス')).toBeInTheDocument();
    expect(screen.getByText('2 / 3 問')).toBeInTheDocument();
    expect(screen.getByText('ボブ')).toBeInTheDocument();
    expect(screen.getByText('3 / 3 問')).toBeInTheDocument();

    // 意図したAPIエンドポイントが呼び出されているか検証
    expect(global.fetch).toHaveBeenCalledWith('/api/tournaments/test-id/status');
  });
});
