import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { quizApiClient } from '../api/QuizApiClient';
import type { Quiz } from '../models/Quiz';

/** 本番問題の描画・画像読み込み・タブ表示が揃った後だけ既読を保存する。 */
export const useQuizOpened = (quiz: Quiz | undefined, ready: boolean) => {
  const client = useQueryClient();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const id = quiz?.id;
  const tournamentId = quiz?.tournamentId;
  const opened = quiz?.isOpened;

  useEffect(() => {
    if (!id || !ready || opened) return;
    let cancelled = false;
    let sent = false;
    let frame = 0;
    /** 二度の描画機会を待ち、遷移や非表示化が先なら送信を取り消す。 */
    const schedule = () => {
      cancelAnimationFrame(frame);
      if (document.visibilityState !== 'visible' || sent) return;
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (cancelled || document.visibilityState !== 'visible') return;
          sent = true;
          void quizApiClient.markOpened(id).then((updated) => {
            client.setQueryData(['quiz', id], updated);
            void client.invalidateQueries({ queryKey: ['tournament', tournamentId, 'board'] });
            if (!cancelled) setError(false);
          }).catch(() => {
            if (!cancelled) setError(true);
          });
        });
      });
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [id, tournamentId, opened, ready, attempt, client]);

  /** 自動再送で画面状態を隠さず、利用者が保存だけを再試行する。 */
  const retry = () => { setError(false); setAttempt((value) => value + 1); };
  return { error, retry };
};
