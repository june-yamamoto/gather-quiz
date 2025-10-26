import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ErrorPage from '../pages/ErrorPage';

describe('ErrorPage', () => {
  it('エラーメッセージとトップページへのリンクが正しく表示されること', () => {
    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'エラーが発生しました' })).toBeInTheDocument();
    expect(screen.getByText('お探しのページが見つからないか、一時的にアクセスできない状態です。')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'トップページに戻る' })).toBeInTheDocument();
  });
});
