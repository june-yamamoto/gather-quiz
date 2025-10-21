import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TournamentPortalPage from './TournamentPortalPage';

describe('大会ポータルページ', () => {
  it('ログインモーダルを開き、ログインを試み、成功時に画面遷移すること', async () => {
    // fetchが呼ばれた際に、成功レスポンスを返すように設定
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(
      <MemoryRouter initialEntries={['/tournaments/test-id']}>
        <Routes>
          <Route path="/tournaments/:id" element={<TournamentPortalPage />} />
        </Routes>
      </MemoryRouter>
    );

    // 1. 主催者ログインボタンをクリックしてモーダルを開く
    fireEvent.click(screen.getByRole('button', { name: '主催者としてログイン' }));

    // 2. モーダルが正しく表示されているか検証
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('管理用パスワード')).toBeInTheDocument();

    // 3. パスワードを入力してログインボタンをクリック
    fireEvent.change(screen.getByLabelText('管理用パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    // 4. APIが正しい引数で呼び出されたか検証
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tournaments/test-id/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'password123' }),
      });
    });
  });
});
