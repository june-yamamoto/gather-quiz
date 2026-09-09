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
  it('正解番号・内容と自由な解答文を併記し、未設定の旧問題には正解を捏造しない', () => {
    const { rerender } = render(<AnswerDisplayContainer quiz={new Quiz({ ...mockQuiz, choiceCount: 2, choices: ['正しい選択肢', '別の選択肢'], correctChoiceIndex: 0 })} />);
    expect(screen.getByRole('region', { name: '正解の選択肢' })).toHaveTextContent('選択肢1');
    expect(screen.getByText('正しい選択肢')).toBeInTheDocument();
    expect(screen.getByText('別の選択肢')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Test Answer')).toBeInTheDocument();
    rerender(<AnswerDisplayContainer quiz={mockQuiz} />);
    expect(screen.queryByRole('region', { name: '正解の選択肢' })).not.toBeInTheDocument();
  });
  it('解答情報が正しくレンダリングされること', () => {
    render(<AnswerDisplayContainer quiz={mockQuiz} />);
    
    expect(screen.getByText('Question')).toBeInTheDocument();
    expect(screen.getByText('Test Answer')).toBeInTheDocument();
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
  
  it('showButtonがfalseの場合、画面遷移ボタンが表示されないこと', () => {
    render(<AnswerDisplayContainer quiz={mockQuiz} showButton={false} />);
    expect(screen.queryByRole('button', { name: 'ボードに戻る' })).not.toBeInTheDocument();
  });
});
