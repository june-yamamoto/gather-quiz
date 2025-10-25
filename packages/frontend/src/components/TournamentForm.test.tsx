import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TournamentForm } from './TournamentForm';
import { Tournament } from '../models/Tournament';

describe('TournamentForm', () => {
  const mockTournament = new Tournament({
    id: 'test-id',
    name: 'Test Tournament',
    password: 'password',
    questionsPerParticipant: 5,
    points: '10,20,30,40,50',
    regulation: 'Test Regulation',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it('新規作成モードで正しくレンダリングされること', () => {
    const { container } = render(<TournamentForm onSubmit={vi.fn()} isEditMode={false} />);

    expect(screen.getByRole('textbox', { name: '大会名' })).toHaveValue('');
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    expect(screen.getByText('この内容で大会を作成する')).toBeInTheDocument();
  });

  it('編集モードで初期値がフォームに設定されること', () => {
    render(<TournamentForm tournament={mockTournament} onSubmit={vi.fn()} isEditMode={true} />);

    expect(screen.getByRole('textbox', { name: '大会名' })).toHaveValue('Test Tournament');
    expect(screen.getByRole('spinbutton', { name: '参加者1人あたりの問題作成数' })).toHaveValue(5);
    expect(screen.getByRole('textbox', { name: '各問題の配点 (カンマ区切り)' })).toHaveValue('10,20,30,40,50');
    expect(screen.getByRole('textbox', { name: 'レギュレーション' })).toHaveValue('Test Regulation');
    expect(screen.getByText('この内容で更新する')).toBeInTheDocument();
  });

  it('フォームをサブミットすると、入力データでonSubmitが呼び出されること', () => {
    const handleSubmit = vi.fn();
    const { container } = render(<TournamentForm onSubmit={handleSubmit} isEditMode={false} />);

    fireEvent.change(screen.getByRole('textbox', { name: '大会名' }), { target: { value: 'New Tournament' } });
    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).not.toBeNull();
    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'new_password' } });
    }

    fireEvent.click(screen.getByText('この内容で大会を作成する'));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Tournament',
        password: 'new_password',
      })
    );
  });
});
