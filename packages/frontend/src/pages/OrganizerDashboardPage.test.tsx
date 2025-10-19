import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrganizerDashboardPage from './OrganizerDashboardPage';

describe('OrganizerDashboardPage', () => {
  const mockData = {
    tournamentName: 'My Test Tournament',
    participants: [
      { id: '1', name: 'Alice', created: 2, required: 3 },
      { id: '2', name: 'Bob', created: 3, required: 3 },
    ],
  };

  it('should fetch and display tournament status correctly', async () => {
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
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('2 / 3 問')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('3 / 3 問')).toBeInTheDocument();

    // Check if the API was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith('/api/tournaments/test-id/status');
  });
});
