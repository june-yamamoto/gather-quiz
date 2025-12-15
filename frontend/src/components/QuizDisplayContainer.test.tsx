import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuizDisplayContainer } from './QuizDisplayContainer';
import { Quiz } from '../models/Quiz';

const mockQuiz = new Quiz({
  id: 'q-1',
  point: 10,
  order: 0,
  isOpened: false,
  questionText: 'Test Question',
  questionImage: 'https://example.com/question.jpg',
  questionLink: 'https://example.com/hint',
  answerText: 'Answer',
  answerImage: null,
  answerLink: null,
  tournamentId: 't-1',
  participantId: 'p-1',
  participantName: 'Test User',
});

describe('QuizDisplayContainer', () => {
  it('クイズ情報が正しくレンダリングされること', () => {
    render(<QuizDisplayContainer quiz={mockQuiz} />);
    
    expect(screen.getByText('10点問題')).toBeInTheDocument();
    expect(screen.getByText('Q. Test Question')).toBeInTheDocument();
    expect(screen.getByText('作成者: Test User')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '問題画像' })).toHaveAttribute('src', 'https://example.com/question.jpg');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/hint');
    expect(screen.getByRole('button', { name: '正解を見る' })).toBeInTheDocument();
  });

  it('ボタンクリックイベントが発火すること', () => {
    const handleClick = vi.fn();
    render(<QuizDisplayContainer quiz={mockQuiz} onButtonClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button', { name: '正解を見る' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('showButtonがfalseの場合、ボタンが表示されないこと', () => {
    render(<QuizDisplayContainer quiz={mockQuiz} showButton={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
