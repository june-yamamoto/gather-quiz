import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TournamentForm } from './TournamentForm';

describe('問題枠の設定', () => {
  it('同じ配点のラベルを問題順ごとに送信する', () => {
    const onSubmit = vi.fn();
    render(<TournamentForm isEditMode={false} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('1問目のラベル'), { target: { value: '声優' } });
    fireEvent.change(screen.getByLabelText('2問目のラベル'), { target: { value: '音楽' } });
    fireEvent.change(screen.getByLabelText(/2問目の配点/), { target: { value: '10' } });
    expect(screen.queryByLabelText('1問目の出題形式')).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole('button', { name: 'この内容で大会を作成する' }).closest('form')!);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      points: '10,10,30',
      questionSlots: [
        { label: '声優', choiceCount: 0 },
        { label: '音楽', choiceCount: 0 },
        { label: '', choiceCount: 0 },
      ],
    }));
  });
});
