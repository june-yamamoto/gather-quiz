import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExpandableQuizImage } from './ExpandableQuizImage';

describe('画像読み込みの例外処理', () => {
  it('失敗時はロード完了を通知せず、再試行した画像の成功時に通知する', () => {
    const onLoad = vi.fn();
    render(<ExpandableQuizImage src="https://example.com/image.png" alt="問題画像" onLoad={onLoad} />);
    fireEvent.error(screen.getByRole('img'));
    expect(onLoad).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('問題画像を読み込めませんでした');
    fireEvent.click(screen.getByRole('button', { name: '再試行' }));
    fireEvent.load(screen.getByRole('img'));
    expect(onLoad).toHaveBeenCalledOnce();
  });
});
