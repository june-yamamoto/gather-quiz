import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuizBoardPage from '../pages/QuizBoardPage';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { Tournament } from '../models/Tournament';
import { Participant } from '../models/Participant';
import { Quiz } from '../models/Quiz';

vi.mock('../api/TournamentApiClient');

const queryClient = new QueryClient();

const mockTournament = new Tournament({
  id: 'test-id',
  name: 'Test Tournament',
  questionsPerParticipant: 1,
  points: '10',
  regulation: '',
  status: 'in_progress',
  participants: [
    new Participant({
      id: 'p-1',
      name: 'Participant 1',
      tournamentId: 'test-id',
      created: 1,
      required: 1,
      quizzes: [
        new Quiz({
          id: 'q-1',
          point: 10,
          tournamentId: 'test-id',
          participantId: 'p-1',
        }),
      ],
    }),
  ],
});

const renderWithProviders = () => {
  vi.spyOn(tournamentApiClient, 'getBoard').mockResolvedValue(mockTournament);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/tournaments/test-id/board']}>
        <Routes>
          <Route path="/tournaments/:tournamentId/board" element={<QuizBoardPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('QuizBoardPage', () => {
  it('大会ボードが正しく表示されること', async () => {
    renderWithProviders();
    await screen.findByRole('heading', { name: 'Test Tournament' });
    expect(screen.getByText('Participant 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10点' })).toBeInTheDocument();
  });
});
