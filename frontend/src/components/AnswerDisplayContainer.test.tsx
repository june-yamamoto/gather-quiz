import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnswerDisplayContainer } from './AnswerDisplayContainer';
import { Quiz } from '../models/Quiz';

const mockQuiz = new Quiz({
  id: 'q-1',
  point: 10,
  order: 0,
  isOpened: true,
  questionText: 'Question',
  questionImage: null,
  questionLink: null,
  answerText: 'Test Answer',
  answerImage: 'https://example.com/answer.jpg',
  answerLink: 'https://example.com/ref',
  tournamentId: 't-1',
  participantId: 'p-1',
});

describe('AnswerDisplayContainer', () => {
  it('解答情報が正しくレンダリングされること', () => {
    render(<AnswerDisplayContainer quiz={mockQuiz} />);
    
    expect(screen.getByText('Q. Question')).toBeInTheDocument();
    expect(screen.getByText('A. Test Answer')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '解答画像' })).toHaveAttribute('src', 'https://example.com/answer.jpg');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/ref');
    expect(screen.getByRole('button', { name: 'ボードに戻る' })).toBeInTheDocument();
  });

  it('ボタンクリックイベントが発火すること', () => {
    const handleClick = vi.fn();
    render(<AnswerDisplayContainer quiz={mockQuiz} onButtonClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'ボードに戻る' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('showButtonがfalseの場合、ボタンが表示されないこと', () => {
    render(<AnswerDisplayContainer quiz={mockQuiz} showButton={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
