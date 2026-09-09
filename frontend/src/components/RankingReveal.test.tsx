import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RankingReveal } from './RankingReveal';
describe('順位発表', () => {
  it('下位から順に発表し、同順位を同時に出して一括表示もできる', () => {
    vi.useFakeTimers();
    try {
      render(<RankingReveal result={{ tournamentName: '大会', rankings: [{ id: 'a', name: '赤', rank: 1, score: 20 }, { id: 'b', name: '青', rank: 1, score: 20 }, { id: 'c', name: '緑', rank: 3, score: 0 }] }} />);
      expect(screen.queryByText('赤')).not.toBeInTheDocument();
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByText('緑')).toBeInTheDocument();
      expect(screen.queryByText('赤')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'すべての順位を表示' }));
      expect(screen.getAllByText('🏆 第1位')).toHaveLength(2);
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    } finally { vi.useRealTimers(); }
  });
});
