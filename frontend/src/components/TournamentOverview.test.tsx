import { render, screen, within } from '../test-utils';
import { describe, it, expect } from 'vitest';
import { TournamentOverview } from './TournamentOverview';
import { Tournament } from '../models/Tournament';
import { Participant } from '../models/Participant';

/** 公開設定だけで大会概要の表示を検証する。 */
const tournament = (data: Partial<ConstructorParameters<typeof Tournament>[0]> = {}) => new Tournament({
  id: 't-1', name: '大会', points: '10,20', questionsPerParticipant: 2,
  status: 'preparing', createdAt: new Date(), ...data,
});

describe('大会概要', () => {
  it('人数、1人あたりの問題数、問題順のラベル・配点・形式とルールを表示する', () => {
    render(<TournamentOverview tournament={tournament({
      questionSlots: [{ label: '声優', choiceCount: 0, questionType: 'normal' }, { label: '音楽', choiceCount: 0, questionType: 'choice' }],
      genres: ' アニメ,音楽 ', regulation: '検索は禁止です。\n相談は可能です。',
      participants: [new Participant({ id: 'p', name: '非表示の名前', tournamentId: 't-1', created: 0, required: 2, quizzes: [] })],
    })} participantCount={1} />);
    expect(screen.getByText('1人')).toBeInTheDocument();
    expect(screen.getByText('1人あたり2問')).toBeInTheDocument();
    const items = within(screen.getByRole('list', { name: '作成する問題の概要' })).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('第1問');
    expect(items[0]).toHaveTextContent('声優');
    expect(items[0]).toHaveTextContent('10点 · 通常問題');
    expect(items[1]).toHaveTextContent('20点 · 選択問題');
    expect(screen.getByText('アニメ')).toBeInTheDocument();
    expect(screen.getByText(/検索は禁止です/)).toHaveStyle({ whiteSpace: 'pre-wrap' });
    expect(screen.queryByText('非表示の名前')).not.toBeInTheDocument();
  });

  it('未設定の項目、参加者0人、形式を参加者が選ぶ旧大会を明示する', () => {
    render(<TournamentOverview tournament={tournament({ regulation: '  ', genres: null })} participantCount={0} />);
    expect(screen.getByText('0人')).toBeInTheDocument();
    expect(screen.getByText('レギュレーションは設定されていません。')).toBeInTheDocument();
    expect(screen.getByText('ジャンルは指定されていません。')).toBeInTheDocument();
    expect(screen.getAllByText(/概要は未設定/)).toHaveLength(2);
    expect(screen.getAllByText(/参加者が出題形式を選択/)).toHaveLength(2);
  });

  it('人数の取得中や失敗を0人と表示しない', () => {
    const { rerender } = render(<TournamentOverview tournament={tournament()} />);
    expect(screen.getByText('確認中…')).toBeInTheDocument();
    rerender(<TournamentOverview tournament={tournament()} participantCountError />);
    expect(screen.getByText('取得できませんでした')).toBeInTheDocument();
    expect(screen.queryByText('0人')).not.toBeInTheDocument();
  });
});
