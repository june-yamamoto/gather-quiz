import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuizMedia } from './QuizMedia';
import { loadYouTubeApi, type YouTubeApi } from '../api/YouTubePlayer';

vi.mock('../api/YouTubePlayer', () => ({ loadYouTubeApi: vi.fn() }));
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

describe('問題と解答のメディア再生', () => {
  it.each([['mp4', 'VIDEO'], ['mp3', 'AUDIO']])('%s は操作付きプレイヤーで再生し、自動再生しない', (extension, tag) => {
    const played = vi.fn();
    render(<QuizMedia url={`https://example.com/a.${extension}`} label="問題メディア" onPlayed={played} />);
    const player = screen.getByLabelText('問題メディア');
    expect(player.tagName).toBe(tag);
    expect(player).toHaveAttribute('controls');
    expect(player).not.toHaveAttribute('autoplay');
    fireEvent.loadedMetadata(player);
    expect(played).not.toHaveBeenCalled();
    fireEvent.playing(player);
    expect(played).toHaveBeenCalledOnce();
  });
  it('404・コーデックエラーから再試行でき、URL変更でエラーを持ち越さない', () => {
    const view = render(<QuizMedia url="https://example.com/bad.mp4" label="問題メディア" />);
    const first = screen.getByLabelText('問題メディア');
    fireEvent.error(first);
    expect(screen.getByRole('alert')).toHaveTextContent('読み込めませんでした');
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(screen.getByRole('button', { name: '再試行' }));
    expect(screen.getByLabelText('問題メディア')).not.toBe(first);
    fireEvent.error(screen.getByLabelText('問題メディア'));
    view.rerender(<QuizMedia url="https://example.com/new.mp3" label="問題メディア" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('無応答時に待機を打ち切り、正常ロード後には誤ったタイムアウトを出さない', () => {
    vi.useFakeTimers();
    render(<QuizMedia url="https://example.com/a.mp3" label="音声" />);
    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByRole('alert')).toHaveTextContent('時間がかかっています');
    fireEvent.click(screen.getByRole('button', { name: '再試行' }));
    fireEvent.loadedMetadata(screen.getByLabelText('音声'));
    act(() => vi.advanceTimersByTime(20000));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.waiting(screen.getByLabelText('音声'));
    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByRole('alert')).toHaveTextContent('時間がかかっています');
  });
  it('一般URLはリンクだけを表示し、不正URLにはリンクを生成しない', () => {
    const view = render(<QuizMedia url="https://example.com/article" label="参考" />);
    expect(screen.getByRole('link')).toHaveTextContent('参考リンク');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    view.rerender(<QuizMedia url="javascript:alert(1)" label="参考" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  it('YouTubeの埋め込み拒否を通知し、再生開始を伝え、閉じると破棄する', async () => {
    let options: ConstructorParameters<YouTubeApi['Player']>[1] | undefined;
    const destroy = vi.fn();
    class Player {
      constructor(_element: HTMLElement, config: ConstructorParameters<YouTubeApi['Player']>[1]) { options = config; }
      destroy = destroy;
    }
    vi.mocked(loadYouTubeApi).mockResolvedValue({ Player });
    const played = vi.fn();
    const view = render(<QuizMedia url="https://youtu.be/M7lc1UVf-VE" label="問題" onPlayed={played} />);
    await waitFor(() => expect(options).toBeDefined());
    act(() => options?.events.onReady());
    expect(played).not.toHaveBeenCalled();
    act(() => options?.events.onStateChange({ data: 1 }));
    expect(played).toHaveBeenCalledOnce();
    act(() => options?.events.onError({ data: 101 }));
    expect(screen.getByRole('alert')).toHaveTextContent('埋め込み許可');
    view.unmount();
    expect(destroy).toHaveBeenCalledOnce();
  });
  it('YouTube APIのロード失敗でも外部リンクと再試行を表示する', async () => {
    vi.mocked(loadYouTubeApi).mockRejectedValue(new Error('offline'));
    render(<QuizMedia url="https://youtu.be/M7lc1UVf-VE" label="問題" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('YouTubeを読み込めません');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://youtu.be/M7lc1UVf-VE');
  });
});
