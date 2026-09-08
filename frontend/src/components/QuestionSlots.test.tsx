import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TournamentForm } from './TournamentForm';

describe('問題枠の設定', () => {
  it('同じ配点のラベルと選択肢数を問題順ごとに送信する', () => {
    const onSubmit = vi.fn();
    render(<TournamentForm isEditMode={false} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('1問目のラベル'), { target: { value: '声優' } });
    fireEvent.change(screen.getByLabelText('2問目のラベル'), { target: { value: '音楽' } });
    fireEvent.change(screen.getByLabelText(/2問目の配点/), { target: { value: '10' } });
    fireEvent.mouseDown(screen.getByLabelText('1問目の出題形式'));
    fireEvent.click(screen.getByRole('option', { name: '選択問題' }));
    fireEvent.change(screen.getByLabelText(/1問目の選択肢数/), { target: { value: '4' } });
    fireEvent.submit(screen.getByRole('button', { name: 'この内容で大会を作成する' }).closest('form')!);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      points: '10,10,30',
      questionSlots: [
        { label: '声優', choiceCount: 4 },
        { label: '音楽', choiceCount: 0 },
        { label: '', choiceCount: 0 },
      ],
    }));
  });
});
