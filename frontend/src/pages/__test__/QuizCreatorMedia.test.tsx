import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuizCreatorPage from '../QuizCreatorPage';
import { quizApiClient } from '../../api/QuizApiClient';
import { uploadApiClient } from '../../api/UploadApiClient';

vi.mock('../../api/QuizApiClient');
vi.mock('../../api/UploadApiClient');
vi.mock('../../api/TournamentApiClient', () => ({ tournamentApiClient: { get: vi.fn().mockResolvedValue({ genres: '', points: '10', questionSlots: [{ label: '', choiceCount: 0 }] }) } }));
/** 保存後の遷移も含めてフォームを検証する。 */
const setup = (suffix = '') => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
  <MemoryRouter initialEntries={[`/gather/tournaments/t/participants/p/quizzes/new?point=10${suffix}`]}><Routes>
    <Route path="/gather/tournaments/:tournamentId/participants/:participantId/quizzes/new" element={<QuizCreatorPage />} />
    <Route path="/gather/tournaments/t/participants/p" element={<div>保存完了</div>} />
  </Routes></MemoryRouter>
</QueryClientProvider>);
beforeEach(() => { vi.clearAllMocks(); vi.spyOn(window, 'alert').mockImplementation(() => {}); });

describe('メディア付き問題の保存', () => {
  it('編集取得に失敗したまま上書きできず、取得を再試行できる', async () => {
    vi.mocked(quizApiClient.get).mockRejectedValue(new Error('取得失敗'));
    setup('&edit=quiz-id');
    expect(await screen.findByRole('alert')).toHaveTextContent('取得できるまで編集できません');
    expect(screen.queryByRole('button', { name: 'この内容で更新する' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '再試行' }));
    await waitFor(() => expect(quizApiClient.get).toHaveBeenCalledTimes(2));
    expect(quizApiClient.update).not.toHaveBeenCalled();
  });
  it('本文なしのURL問題を保存でき、不正URLは送信しない', async () => {
    setup();
    fireEvent.change(await screen.findByLabelText('問題のURL（参考リンク）'), { target: { value: 'javascript:alert(1)' } });
    fireEvent.change(screen.getByLabelText('解答のURL（参考リンク）'), { target: { value: 'https://example.com/answer' } });
    fireEvent.click(screen.getByRole('button', { name: 'この内容で問題を保存する' }));
    expect(screen.getByRole('alert')).toHaveTextContent('有効なURL');
    expect(quizApiClient.create).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('問題のURL（参考リンク）'), { target: { value: ' https://youtu.be/M7lc1UVf-VE ' } });
    fireEvent.click(screen.getByRole('button', { name: 'この内容で問題を保存する' }));
    await screen.findByText('保存完了');
    expect(quizApiClient.create).toHaveBeenCalledWith(expect.objectContaining({ questionLink: 'https://youtu.be/M7lc1UVf-VE', questionText: '' }));
  });
  it('アップロード失敗では保存せず、再試行でき、保存失敗後は転送済みファイルを再利用する', async () => {
    vi.mocked(uploadApiClient.uploadMedia).mockRejectedValueOnce(new Error('アップロード失敗')).mockResolvedValue('https://example.com/upload.mp3');
    vi.mocked(quizApiClient.create).mockRejectedValueOnce(new Error('保存失敗'));
    setup();
    fireEvent.change(await screen.findByLabelText('解答文'), { target: { value: '答え' } });
    fireEvent.change(screen.getByLabelText('問題の動画・音声ファイル'), { target: { files: [new File(['sound'], 'sound.mp3', { type: 'audio/mpeg' })] } });
    fireEvent.click(screen.getByRole('button', { name: 'この内容で問題を保存する' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('アップロード失敗');
    expect(quizApiClient.create).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'この内容で問題を保存する' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('保存失敗'));
    expect(screen.getByLabelText('問題のURL（参考リンク）')).toHaveValue('https://example.com/upload.mp3');
    fireEvent.click(screen.getByRole('button', { name: 'この内容で問題を保存する' }));
    await screen.findByText('保存完了');
    expect(uploadApiClient.uploadMedia).toHaveBeenCalledTimes(2);
  });
});
