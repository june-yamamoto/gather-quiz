export type YouTubePlayer = { destroy: () => void };
type PlayerEvent = { data: number };
export type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host: string;
      playerVars: { origin: string; playsinline: number; autoplay: number };
      events: {
        onReady: () => void;
        onError: (event: PlayerEvent) => void;
        onStateChange: (event: PlayerEvent) => void;
      };
    }
  ) => YouTubePlayer;
};
declare global {
  interface Window {
    YT?: YouTubeApi;
  }
}
let pending: Promise<YouTubeApi> | undefined;

/** 共有APIを一度だけロードし、遮断やオフライン時も待機を打ち切って再試行可能にする。 */
export const loadYouTubeApi = (): Promise<YouTubeApi> => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;
  pending = new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    /** 既存のグローバルコールバックを上書きせずAPIの準備を待つ。 */
    const finish = (success: boolean) => {
      clearInterval(poll);
      clearTimeout(timeout);
      script.onerror = null;
      if (success && window.YT) resolve(window.YT);
      else {
        script.remove();
        reject(new Error('YouTubeを読み込めませんでした。'));
      }
    };
    const poll = window.setInterval(() => {
      if (window.YT?.Player) finish(true);
    }, 50);
    const timeout = window.setTimeout(() => finish(false), 15000);
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    pending = undefined;
    throw error;
  });
  return pending;
};
