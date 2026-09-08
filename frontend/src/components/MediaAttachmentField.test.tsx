import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaAttachmentField } from './MediaAttachmentField';

describe('動画・音声添付欄', () => {
  it('不正ファイルを選んでも既存の添付を上書きしない', () => {
    const onFileChange = vi.fn();
    render(<MediaAttachmentField label="問題" url="https://example.com/original.mp4" file={null} onUrlChange={vi.fn()} onFileChange={onFileChange} />);
    fireEvent.change(screen.getByLabelText('問題の動画・音声ファイル'), { target: { files: [new File(['bad'], 'bad.html', { type: 'text/html' })] } });
    expect(onFileChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    const file = new File(['audio'], 'sound.mp3', { type: 'audio/mpeg' });
    fireEvent.change(screen.getByLabelText('問題の動画・音声ファイル'), { target: { files: [file] } });
    expect(onFileChange).toHaveBeenCalledWith(file);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('選択取消は既存URLを残し、削除は両方を消す', () => {
    const onFileChange = vi.fn();
    const onUrlChange = vi.fn();
    render(<MediaAttachmentField label="解答" url="https://example.com/old.mp4" file={new File(['new'], 'new.mp3', { type: 'audio/mpeg' })} onUrlChange={onUrlChange} onFileChange={onFileChange} />);
    expect(screen.getByLabelText('解答のURL（参考リンク）')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'ファイル選択を取り消す' }));
    expect(onFileChange).toHaveBeenCalledWith(null);
    expect(onUrlChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '動画・音声・URLを削除' }));
    expect(onUrlChange).toHaveBeenCalledWith('');
  });
});
