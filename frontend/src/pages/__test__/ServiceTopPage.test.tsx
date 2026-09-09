import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ServiceTopPage from '../ServiceTopPage';

describe('ServiceTopPage', () => {
  it('ページが正しくレンダリングされること', () => {
    render(
      <MemoryRouter>
        <ServiceTopPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'GatherQuiz' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'クイズ大会を新しく作成する' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'はじめての使い方' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '主催者：大会を作る' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '参加者：問題を作る' })).toBeInTheDocument();
  });
});
