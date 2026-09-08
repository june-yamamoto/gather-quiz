import { describe, expect, it } from 'vitest';
import { resolveMedia, validateMediaFile, safeMediaUrl } from './media';

describe('メディアの入力検証と判定', () => {
  it.each(['javascript:alert(1)', 'data:text/html,test', '//example.com/a', 'https://user:pass@example.com', 'not a url'])('危険・不正なURL %s を拒否する', (url) => {
    expect(safeMediaUrl(url)).toBeNull();
  });
  it.each(['https://youtu.be/M7lc1UVf-VE', 'https://www.youtube.com/watch?v=M7lc1UVf-VE', 'https://youtube.com/shorts/M7lc1UVf-VE', 'https://youtube.com/embed/M7lc1UVf-VE'])('YouTube URL %s を正規化する', (url) => {
    expect(resolveMedia(url)).toMatchObject({ kind: 'youtube', id: 'M7lc1UVf-VE' });
  });
  it('偽装ホストは埋め込まない', () => {
    expect(resolveMedia('https://youtube.com.evil.test/watch?v=M7lc1UVf-VE')?.kind).toBe('link');
    expect(resolveMedia('https://example.com/?file=a.mp4')?.kind).toBe('link');
  });
  it('クエリ付きの動画・音声と一般URLを区別する', () => {
    expect(resolveMedia('https://example.com/MOVIE.MP4?token=x')?.kind).toBe('video');
    expect(resolveMedia('https://example.com/music.m4a#t=10')?.kind).toBe('audio');
    expect(resolveMedia('https://example.com/article')?.kind).toBe('link');
  });
  it('空・巨大・未対応形式をアップロード前に拒否する', () => {
    expect(validateMediaFile({ size: 0, type: 'audio/mpeg' })).toBeTruthy();
    expect(validateMediaFile({ size: 100 * 1024 * 1024 + 1, type: 'video/mp4' })).toBeTruthy();
    expect(validateMediaFile({ size: 10, type: 'text/html' })).toBeTruthy();
    expect(validateMediaFile({ size: 10, type: 'video/mp4' })).toBeNull();
  });
});
