import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TournamentPortalPage from './TournamentPortalPage';

describe('大会ポータルページ', () => {
  it('ログインモーダルを開き、ログインを試み、成功時に画面遷移すること', async () => {
    // Mock the global fetch function
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

    // 1. Click the organizer login button
    fireEvent.click(screen.getByRole('button', { name: '主催者としてログイン' }));

    // 2. Assert the modal is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('管理用パスワード')).toBeInTheDocument();

    // 3. Fill in the password and click login
    fireEvent.change(screen.getByLabelText('管理用パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    // 4. Assert the API was called correctly
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
